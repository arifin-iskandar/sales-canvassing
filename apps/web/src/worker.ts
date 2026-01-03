/**
 * Cloudflare Worker entry point for Sales Canvassing
 */
import startWorker from '@tanstack/react-start/server-entry'
import type { AppEnv, AppServerContext, SessionSummary } from './server/env'
import { handleApiRequest } from './server/api'
import { readSessionFromCookie, SESSION_COOKIE_NAME } from './server/session'

const PUBLIC_PATHS = new Set(['/', '/login', '/signup', '/forgot-password'])

export default {
  ...startWorker,
  async fetch(
    request: Request,
    env: AppEnv,
    executionCtx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url)
    const requestId = crypto.randomUUID()

    // Build server context
    const serverContext: AppServerContext = {
      env,
      executionCtx,
      request,
      requestId,
      session: null,
      tenant: null,
    }

    // Read session from cookie
    const cookieHeader = request.headers.get('cookie') ?? ''
    const hasAuthCookie = cookieHeader.includes(`${SESSION_COOKIE_NAME}=`)

    if (hasAuthCookie) {
      const { session } = await readSessionFromCookie(env, cookieHeader)
      if (session) {
        serverContext.session = session
      }
    }

    // Handle API requests
    if (url.pathname.startsWith('/api')) {
      return handleApiRequest(request, serverContext)
    }

    // Worker guard: redirect unauthenticated users to login
    // Only for HTML requests (not assets)
    const isHtmlRequest =
      request.method === 'GET' &&
      (request.headers.get('accept')?.includes('text/html') ?? false)

    const isProtectedPath =
      !PUBLIC_PATHS.has(url.pathname) &&
      !url.pathname.startsWith('/_') &&
      !url.pathname.includes('.')

    if (isHtmlRequest && isProtectedPath && !serverContext.session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', url.pathname)
      return Response.redirect(loginUrl.toString(), 302)
    }

    // Pass to TanStack Start router
    // @ts-expect-error - TanStack Start types
    return startWorker.fetch(request, { context: serverContext })
  },
}
