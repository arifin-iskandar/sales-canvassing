/**
 * API client for making requests to the server
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type ApiRequestOptions<TBody = unknown> = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: TBody
  signal?: AbortSignal
}

/**
 * Make an API request
 */
export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = 'GET', body, signal } = options

  const headers: Record<string, string> = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
    signal,
  })

  // Handle redirect to login
  if (response.status === 401) {
    const isAuthPage =
      window.location.pathname === '/login' ||
      window.location.pathname === '/signup'

    if (!isAuthPage) {
      const loginUrl = new URL('/login', window.location.origin)
      loginUrl.searchParams.set('redirect', window.location.pathname)
      window.location.href = loginUrl.toString()
    }

    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Request failed',
      response.status,
      data.code,
    )
  }

  return data as TResponse
}
