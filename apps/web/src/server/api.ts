/**
 * Main API request dispatcher
 */
import type { AppServerContext } from './env'
import { handleAuthRequest } from './auth'
import { jsonResponse } from './http'

export async function handleApiRequest(
  request: Request,
  context: AppServerContext,
): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(context.env.PUBLIC_MARKETING_URL),
    })
  }

  // Auth endpoints (public)
  if (path.startsWith('/api/auth')) {
    const authResponse = await handleAuthRequest(request, context, url)
    if (authResponse) return authResponse
  }

  // Mobile sync endpoint (uses bearer token)
  if (path.startsWith('/api/sync')) {
    // TODO: Implement sync API
    return jsonResponse(request, context.env, { ok: false, error: 'Not implemented' }, { status: 501 })
  }

  // All other endpoints require session
  if (!context.session) {
    return jsonResponse(
      request,
      context.env,
      { ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

  // Tenant-scoped endpoints
  const tenantMatch = path.match(/^\/api\/t\/([^/]+)\/(.*)$/)
  if (tenantMatch) {
    const [, tenantKey, subPath] = tenantMatch
    return handleTenantApiRequest(request, context, tenantKey, subPath)
  }

  return jsonResponse(request, context.env, { ok: false, error: 'Not found' }, { status: 404 })
}

async function handleTenantApiRequest(
  request: Request,
  context: AppServerContext,
  tenantKey: string,
  subPath: string,
): Promise<Response> {
  // Verify tenant access
  if (context.session?.tenant !== tenantKey && context.tenant?.slug !== tenantKey) {
    return jsonResponse(
      request,
      context.env,
      { ok: false, error: 'Forbidden', code: 'FORBIDDEN' },
      { status: 403 },
    )
  }

  // Route to appropriate handler based on subPath
  if (subPath.startsWith('customers')) {
    // TODO: handleCustomersApiRequest
    return jsonResponse(request, context.env, { ok: false, error: 'Not implemented' }, { status: 501 })
  }

  if (subPath.startsWith('routes')) {
    // TODO: handleRoutesApiRequest
    return jsonResponse(request, context.env, { ok: false, error: 'Not implemented' }, { status: 501 })
  }

  if (subPath.startsWith('visits')) {
    // TODO: handleVisitsApiRequest
    return jsonResponse(request, context.env, { ok: false, error: 'Not implemented' }, { status: 501 })
  }

  if (subPath.startsWith('invoices')) {
    // TODO: handleInvoicesApiRequest
    return jsonResponse(request, context.env, { ok: false, error: 'Not implemented' }, { status: 501 })
  }

  if (subPath.startsWith('payments')) {
    // TODO: handlePaymentsApiRequest
    return jsonResponse(request, context.env, { ok: false, error: 'Not implemented' }, { status: 501 })
  }

  if (subPath.startsWith('reports')) {
    // TODO: handleReportsApiRequest
    return jsonResponse(request, context.env, { ok: false, error: 'Not implemented' }, { status: 501 })
  }

  if (subPath.startsWith('media')) {
    // TODO: handleMediaApiRequest
    return jsonResponse(request, context.env, { ok: false, error: 'Not implemented' }, { status: 501 })
  }

  return jsonResponse(request, context.env, { ok: false, error: 'Not found' }, { status: 404 })
}

function corsHeaders(origin: string): Headers {
  return new Headers({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  })
}
