/**
 * Environment bindings for Cloudflare Workers
 */

export interface AppEnv {
  // Secrets (set in Cloudflare dashboard or wrangler.toml)
  SESSION_SECRET: string
  DATABASE_URL?: string
  NEON_DATABASE_URL?: string

  // Environment variables
  APP_ENV: 'development' | 'staging' | 'production'
  PUBLIC_MARKETING_URL: string
  MONEY_DEFAULT_CURRENCY: 'IDR' | 'USD'

  // Bindings
  ASSETS: Fetcher
  PHOTOS: R2Bucket
}

export interface AppServerContext {
  env: AppEnv
  executionCtx: ExecutionContext
  request: Request
  requestId?: string
  session?: SessionSummary | null
  tenant?: TenantInfo | null
}

export interface SessionSummary {
  sub: string
  tenant: string
  email?: string
  phone?: string
  role: 'owner' | 'admin' | 'supervisor' | 'sales' | 'collector'
  name?: string
  slug?: string
  exp?: number
}

export interface TenantInfo {
  id: string
  slug: string
  name: string
}
