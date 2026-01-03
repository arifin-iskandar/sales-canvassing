/**
 * HTTP response utilities
 */
import type { AppEnv } from './env'

type JsonResponseOptions = {
  status?: number
  headers?: Record<string, string>
}

/**
 * Create a JSON response with CORS headers
 */
export function jsonResponse<T>(
  request: Request,
  env: AppEnv,
  data: T,
  options: JsonResponseOptions = {},
): Response {
  const { status = 200, headers = {} } = options

  const origin = request.headers.get('origin') || env.PUBLIC_MARKETING_URL

  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      ...headers,
    },
  })
}

/**
 * Create an options response for CORS preflight
 */
export function optionsResponse(allowedOrigin: string): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  })
}

/**
 * Parse JSON body from request
 */
export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return await request.json() as T
  } catch {
    return null
  }
}
