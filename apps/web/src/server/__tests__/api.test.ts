import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleApiRequest } from '../api'
import type { AppServerContext, AppEnv, SessionSummary } from '../env'

// Mock the database module
vi.mock('@canvassing/db', () => ({
  getNeonClient: vi.fn(),
  hasDatabaseConnection: vi.fn().mockReturnValue(false),
}))

// Mock environment
const mockEnv: AppEnv = {
  SESSION_SECRET: 'test-secret-key-minimum-16-chars',
  APP_ENV: 'development',
  DATABASE_URL: 'mock://database',
  PUBLIC_MARKETING_URL: 'http://localhost:4321',
}

// Create mock context
function createMockContext(
  session?: SessionSummary,
  tenant?: { id: string; slug: string },
): AppServerContext {
  return {
    env: mockEnv,
    session: session ?? null,
    tenant: tenant ?? undefined,
  }
}

// Create mock request
function createMockRequest(
  method: string,
  path: string,
  body?: object,
  headers?: Record<string, string>,
): Request {
  const url = new URL(`http://localhost${path}`)
  return new Request(url.toString(), {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('API Request Dispatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CORS handling', () => {
    it('should handle OPTIONS preflight requests', async () => {
      const context = createMockContext()
      const request = createMockRequest('OPTIONS', '/api/anything')

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(204)
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Authorization')
    })

    it('should include marketing URL in CORS origin', async () => {
      const context = createMockContext()
      const request = createMockRequest('OPTIONS', '/api/anything')

      const response = await handleApiRequest(request, context)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(mockEnv.PUBLIC_MARKETING_URL)
    })
  })

  describe('Auth endpoints routing', () => {
    it('should route /api/auth/login to auth handler', async () => {
      const context = createMockContext()
      const request = createMockRequest('POST', '/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      })

      const response = await handleApiRequest(request, context)

      // Auth handler will fail because DB is not configured, but it routes correctly
      expect(response.status).toBe(503) // Database not configured
    })

    it('should route /api/auth/signup to auth handler', async () => {
      const context = createMockContext()
      const request = createMockRequest('POST', '/api/auth/signup', {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        tenantName: 'Test Company',
      })

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(503) // Database not configured
    })

    it('should route /api/auth/logout to auth handler', async () => {
      const session: SessionSummary = {
        sub: 'user-123',
        tenant: 'tenant-456',
        role: 'owner',
        name: 'Test User',
        slug: 'test-company',
      }
      const context = createMockContext(session)
      const request = createMockRequest('POST', '/api/auth/logout')

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.ok).toBe(true)
    })

    it('should route /api/auth/me to auth handler', async () => {
      const session: SessionSummary = {
        sub: 'user-123',
        tenant: 'tenant-456',
        email: 'test@example.com',
        role: 'owner',
        name: 'Test User',
        slug: 'test-company',
      }
      const context = createMockContext(session)
      const request = createMockRequest('GET', '/api/auth/me')

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.ok).toBe(true)
      expect(body.user.id).toBe('user-123')
    })
  })

  describe('Protected endpoints', () => {
    it('should return 401 for protected endpoints without session', async () => {
      const context = createMockContext()
      const request = createMockRequest('GET', '/api/t/test-company/customers')

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.code).toBe('UNAUTHORIZED')
    })

    it('should allow access to protected endpoints with valid session', async () => {
      const session: SessionSummary = {
        sub: 'user-123',
        tenant: 'tenant-456',
        role: 'owner',
        name: 'Test User',
        slug: 'test-company',
      }
      const context = createMockContext(session, { id: 'tenant-456', slug: 'test-company' })
      const request = createMockRequest('GET', '/api/t/test-company/customers')

      const response = await handleApiRequest(request, context)

      // Should return 501 (not implemented) not 401 (unauthorized)
      expect(response.status).toBe(501)
    })
  })

  describe('Tenant scope enforcement', () => {
    it('should return 403 when accessing wrong tenant', async () => {
      const session: SessionSummary = {
        sub: 'user-123',
        tenant: 'tenant-456',
        role: 'owner',
        name: 'Test User',
        slug: 'my-company',
      }
      const context = createMockContext(session, { id: 'tenant-456', slug: 'my-company' })
      const request = createMockRequest('GET', '/api/t/other-company/customers')

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(403)
      const body = await response.json()
      expect(body.code).toBe('FORBIDDEN')
    })

    it('should allow access by tenant ID match', async () => {
      const session: SessionSummary = {
        sub: 'user-123',
        tenant: 'my-company', // session.tenant matches tenantKey
        role: 'owner',
        name: 'Test User',
        slug: 'my-company',
      }
      const context = createMockContext(session)
      const request = createMockRequest('GET', '/api/t/my-company/customers')

      const response = await handleApiRequest(request, context)

      // Should be allowed (returns 501 because not implemented, not 403)
      expect(response.status).toBe(501)
    })

    it('should allow access by tenant slug match', async () => {
      const session: SessionSummary = {
        sub: 'user-123',
        tenant: 'tenant-456-uuid',
        role: 'owner',
        name: 'Test User',
        slug: 'my-company',
      }
      const context = createMockContext(session, { id: 'tenant-456-uuid', slug: 'my-company' })
      const request = createMockRequest('GET', '/api/t/my-company/customers')

      const response = await handleApiRequest(request, context)

      // Should be allowed (returns 501 because not implemented, not 403)
      expect(response.status).toBe(501)
    })
  })

  describe('Tenant API routing', () => {
    const session: SessionSummary = {
      sub: 'user-123',
      tenant: 'test-company',
      role: 'owner',
      name: 'Test User',
      slug: 'test-company',
    }

    it('should route /api/t/:tenant/customers', async () => {
      const context = createMockContext(session)
      const request = createMockRequest('GET', '/api/t/test-company/customers')

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(501) // Not implemented, but routed correctly
    })

    it('should route /api/t/:tenant/routes', async () => {
      const context = createMockContext(session)
      const request = createMockRequest('GET', '/api/t/test-company/routes')

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(501)
    })

    it('should route /api/t/:tenant/visits', async () => {
      const context = createMockContext(session)
      const request = createMockRequest('POST', '/api/t/test-company/visits/check-in', {
        customerId: 'customer-123',
        latitude: -6.2088,
        longitude: 106.8456,
      })

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(501)
    })

    it('should route /api/t/:tenant/invoices', async () => {
      const context = createMockContext(session)
      const request = createMockRequest('GET', '/api/t/test-company/invoices')

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(501)
    })

    it('should route /api/t/:tenant/payments', async () => {
      const context = createMockContext(session)
      const request = createMockRequest('GET', '/api/t/test-company/payments')

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(501)
    })

    it('should route /api/t/:tenant/reports', async () => {
      const context = createMockContext(session)
      const request = createMockRequest('GET', '/api/t/test-company/reports/aging')

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(501)
    })

    it('should route /api/t/:tenant/media', async () => {
      const context = createMockContext(session)
      const request = createMockRequest('POST', '/api/t/test-company/media/upload')

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(501)
    })

    it('should return 404 for unknown tenant subpath', async () => {
      const context = createMockContext(session)
      const request = createMockRequest('GET', '/api/t/test-company/unknown')

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(404)
    })
  })

  describe('Sync endpoint', () => {
    it('should route /api/sync endpoints', async () => {
      const context = createMockContext()
      const request = createMockRequest('POST', '/api/sync', {
        events: [],
      })

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(501) // Not implemented
    })
  })

  describe('404 handling', () => {
    it('should return 404 for unknown API paths', async () => {
      const session: SessionSummary = {
        sub: 'user-123',
        tenant: 'tenant-456',
        role: 'owner',
        name: 'Test User',
        slug: 'test-company',
      }
      const context = createMockContext(session)
      const request = createMockRequest('GET', '/api/unknown')

      const response = await handleApiRequest(request, context)

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body.error).toBe('Not found')
    })
  })
})

describe('Role-based access patterns', () => {
  describe('Owner role', () => {
    it('should allow owner to access tenant endpoints', async () => {
      const session: SessionSummary = {
        sub: 'user-123',
        tenant: 'test-company',
        role: 'owner',
        name: 'Test User',
        slug: 'test-company',
      }
      const context = createMockContext(session)
      const request = createMockRequest('GET', '/api/t/test-company/customers')

      const response = await handleApiRequest(request, context)

      expect(response.status).not.toBe(401)
      expect(response.status).not.toBe(403)
    })
  })

  describe('Admin role', () => {
    it('should allow admin to access tenant endpoints', async () => {
      const session: SessionSummary = {
        sub: 'user-123',
        tenant: 'test-company',
        role: 'admin',
        name: 'Admin User',
        slug: 'test-company',
      }
      const context = createMockContext(session)
      const request = createMockRequest('GET', '/api/t/test-company/customers')

      const response = await handleApiRequest(request, context)

      expect(response.status).not.toBe(401)
      expect(response.status).not.toBe(403)
    })
  })

  describe('Sales role', () => {
    it('should allow sales to access tenant endpoints', async () => {
      const session: SessionSummary = {
        sub: 'user-123',
        tenant: 'test-company',
        role: 'sales',
        name: 'Sales User',
        slug: 'test-company',
      }
      const context = createMockContext(session)
      const request = createMockRequest('GET', '/api/t/test-company/routes')

      const response = await handleApiRequest(request, context)

      expect(response.status).not.toBe(401)
      expect(response.status).not.toBe(403)
    })
  })

  describe('Collector role', () => {
    it('should allow collector to access tenant endpoints', async () => {
      const session: SessionSummary = {
        sub: 'user-123',
        tenant: 'test-company',
        role: 'collector',
        name: 'Collector User',
        slug: 'test-company',
      }
      const context = createMockContext(session)
      const request = createMockRequest('GET', '/api/t/test-company/payments')

      const response = await handleApiRequest(request, context)

      expect(response.status).not.toBe(401)
      expect(response.status).not.toBe(403)
    })
  })
})

describe('API Error Responses', () => {
  it('should include ok: false in error responses', async () => {
    const context = createMockContext()
    const request = createMockRequest('GET', '/api/t/test-company/customers')

    const response = await handleApiRequest(request, context)

    const body = await response.json()
    expect(body.ok).toBe(false)
  })

  it('should include error message in responses', async () => {
    const context = createMockContext()
    const request = createMockRequest('GET', '/api/unknown')

    const response = await handleApiRequest(request, context)

    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('should include error code for known errors', async () => {
    const context = createMockContext()
    const request = createMockRequest('GET', '/api/t/test-company/customers')

    const response = await handleApiRequest(request, context)

    const body = await response.json()
    expect(body.code).toBe('UNAUTHORIZED')
  })
})
