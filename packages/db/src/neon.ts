import { neon, neonConfig, NeonQueryFunction } from '@neondatabase/serverless'

// Configure Neon for edge runtime
neonConfig.fetchConnectionCache = true

type AppEnv = {
  DATABASE_URL?: string
  NEON_DATABASE_URL?: string
}

const clientCache = new Map<string, NeonQueryFunction<false, false>>()

/**
 * Resolve DATABASE_URL from environment, with fallback to NEON_DATABASE_URL
 */
export function resolveDatabaseUrl(env: AppEnv): string | undefined {
  const raw = env.DATABASE_URL || env.NEON_DATABASE_URL
  if (!raw) return undefined

  // Ensure sslmode is set
  let url = raw
  if (!url.includes('sslmode=')) {
    url += (url.includes('?') ? '&' : '?') + 'sslmode=require'
  }

  // Remove channel_binding if present (breaks some edge runtimes)
  url = url.replace(/[&?]channel_binding=[^&]*/g, '')

  return url
}

/**
 * Get a Neon client for the given environment
 * Clients are cached per connection string
 */
export function getNeonClient(env: AppEnv): NeonQueryFunction<false, false> {
  const connectionString = resolveDatabaseUrl(env)
  if (!connectionString) {
    throw new Error('DATABASE_URL or NEON_DATABASE_URL is required')
  }

  const cached = clientCache.get(connectionString)
  if (cached) return cached

  const client = neon(connectionString)
  clientCache.set(connectionString, client)
  return client
}

/**
 * Check if database is available
 */
export function hasDatabaseConnection(env: AppEnv): boolean {
  return !!(env.DATABASE_URL || env.NEON_DATABASE_URL)
}
