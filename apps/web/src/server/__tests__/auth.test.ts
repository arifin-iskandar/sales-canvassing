import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { handleAuthRequest } from '../auth'
import * as sessionModule from '../session'
import * as dbModule from '@canvassing/db'
import type { AppServerContext, AppEnv, SessionSummary } from '../env'

// Mock the database module
vi.mock('@canvassing/db', () => ({
  getNeonClient: vi.fn(),
  hasDatabaseConnection: vi.fn(),
}))

// Mock environment
const mockEnv: AppEnv = {
  SESSION_SECRET: 'test-secret-key-minimum-16-chars',
  APP_ENV: 'development',
  DATABASE_URL: 'mock://database',
}

// Create mock context
function createMockContext(session?: SessionSummary): AppServerContext {
  return {
    env: mockEnv,
    session: session ?? null,
  }
}

// Create mock request
function createMockRequest(
  method: string,
  path: string,
  body?: object,
): { request: Request; url: URL } {
  const url = new URL(`http://localhost${path}`)
  const request = new Request(url.toString(), {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  return { request, url }
}

describe('Auth API Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleAuthRequest routing', () => {
    it('should return null for non-auth paths', async () => {
      const context = createMockContext()
      const { request, url } = createMockRequest('GET', '/api/customers')

      const result = await handleAuthRequest(request, context, url)

      expect(result).toBeNull()
    })

    it('should return null for wrong method on login', async () => {
      const context = createMockContext()
      const { request, url } = createMockRequest('GET', '/api/auth/login')

      const result = await handleAuthRequest(request, context, url)

      expect(result).toBeNull()
    })
  })

  describe('POST /api/auth/login', () => {
    it('should return 400 for missing credentials', async () => {
      vi.mocked(dbModule.hasDatabaseConnection).mockReturnValue(true)
      const context = createMockContext()
      const { request, url } = createMockRequest('POST', '/api/auth/login', {
        password: 'password123',
      })

      const result = await handleAuthRequest(request, context, url)

      expect(result).not.toBeNull()
      expect(result?.status).toBe(400)
      const body = await result?.json()
      expect(body.ok).toBe(false)
      expect(body.error).toContain('Email or phone required')
    })

    it('should return 400 for short password', async () => {
      const context = createMockContext()
      const { request, url } = createMockRequest('POST', '/api/auth/login', {
        email: 'test@example.com',
        password: '12345', // too short
      })

      const result = await handleAuthRequest(request, context, url)

      expect(result).not.toBeNull()
      expect(result?.status).toBe(400)
    })

    it('should return 503 when database not configured', async () => {
      vi.mocked(dbModule.hasDatabaseConnection).mockReturnValue(false)
      const context = createMockContext()
      const { request, url } = createMockRequest('POST', '/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      })

      const result = await handleAuthRequest(request, context, url)

      expect(result).not.toBeNull()
      expect(result?.status).toBe(503)
      const body = await result?.json()
      expect(body.error).toBe('Database not configured')
    })

    it('should return 401 for non-existent user', async () => {
      vi.mocked(dbModule.hasDatabaseConnection).mockReturnValue(true)
      vi.mocked(dbModule.getNeonClient).mockReturnValue((() => Promise.resolve([])) as any)
      const context = createMockContext()
      const { request, url } = createMockRequest('POST', '/api/auth/login', {
        email: 'nonexistent@example.com',
        password: 'password123',
      })

      const result = await handleAuthRequest(request, context, url)

      expect(result).not.toBeNull()
      expect(result?.status).toBe(401)
      const body = await result?.json()
      expect(body.error).toBe('Invalid credentials')
    })

    it('should return 401 for wrong password', async () => {
      const passwordHash = await sessionModule.hashPassword('correctPassword')

      vi.mocked(dbModule.hasDatabaseConnection).mockReturnValue(true)
      vi.mocked(dbModule.getNeonClient).mockReturnValue((() =>
        Promise.resolve([
          {
            id: 'user-123',
            email: 'test@example.com',
            phone: null,
            password_hash: passwordHash,
            full_name: 'Test User',
            tenant_id: 'tenant-456',
            role: 'owner',
            slug: 'test-company',
            tenant_name: 'Test Company',
          },
        ])) as any)
      const context = createMockContext()
      const { request, url } = createMockRequest('POST', '/api/auth/login', {
        email: 'test@example.com',
        password: 'wrongPassword',
      })

      const result = await handleAuthRequest(request, context, url)

      expect(result).not.toBeNull()
      expect(result?.status).toBe(401)
    })

    it('should return success with session cookie for valid login', async () => {
      const passwordHash = await sessionModule.hashPassword('correctPassword')

      vi.mocked(dbModule.hasDatabaseConnection).mockReturnValue(true)
      vi.mocked(dbModule.getNeonClient).mockReturnValue((() =>
        Promise.resolve([
          {
            id: 'user-123',
            email: 'test@example.com',
            phone: null,
            password_hash: passwordHash,
            full_name: 'Test User',
            tenant_id: 'tenant-456',
            role: 'owner',
            slug: 'test-company',
            tenant_name: 'Test Company',
          },
        ])) as any)
      const context = createMockContext()
      const { request, url } = createMockRequest('POST', '/api/auth/login', {
        email: 'test@example.com',
        password: 'correctPassword',
      })

      const result = await handleAuthRequest(request, context, url)

      expect(result).not.toBeNull()
      expect(result?.status).toBe(200)

      const cookie = result?.headers.get('Set-Cookie')
      expect(cookie).toContain('canvassing_session=')
      expect(cookie).toContain('HttpOnly')

      const body = await result?.json()
      expect(body.ok).toBe(true)
      expect(body.user.id).toBe('user-123')
      expect(body.tenant.id).toBe('tenant-456')
    })

    it('should support phone-based login', async () => {
      const passwordHash = await sessionModule.hashPassword('correctPassword')

      vi.mocked(dbModule.hasDatabaseConnection).mockReturnValue(true)
      vi.mocked(dbModule.getNeonClient).mockReturnValue((() =>
        Promise.resolve([
          {
            id: 'user-123',
            email: null,
            phone: '+6281234567890',
            password_hash: passwordHash,
            full_name: 'Test User',
            tenant_id: 'tenant-456',
            role: 'sales',
            slug: 'test-company',
            tenant_name: 'Test Company',
          },
        ])) as any)
      const context = createMockContext()
      const { request, url } = createMockRequest('POST', '/api/auth/login', {
        phone: '+6281234567890',
        password: 'correctPassword',
      })

      const result = await handleAuthRequest(request, context, url)

      expect(result?.status).toBe(200)
      const body = await result?.json()
      expect(body.ok).toBe(true)
      expect(body.user.phone).toBe('+6281234567890')
    })
  })

  describe('POST /api/auth/signup', () => {
    it('should return 400 for missing required fields', async () => {
      const context = createMockContext()
      const { request, url } = createMockRequest('POST', '/api/auth/signup', {
        email: 'test@example.com',
        // missing password, fullName, tenantName
      })

      const result = await handleAuthRequest(request, context, url)

      expect(result?.status).toBe(400)
    })

    it('should return 400 for short tenant name', async () => {
      const context = createMockContext()
      const { request, url } = createMockRequest('POST', '/api/auth/signup', {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        tenantName: 'X', // too short
      })

      const result = await handleAuthRequest(request, context, url)

      expect(result?.status).toBe(400)
    })

    it('should return 503 when database not configured', async () => {
      vi.mocked(dbModule.hasDatabaseConnection).mockReturnValue(false)
      const context = createMockContext()
      const { request, url } = createMockRequest('POST', '/api/auth/signup', {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        tenantName: 'Test Company',
      })

      const result = await handleAuthRequest(request, context, url)

      expect(result?.status).toBe(503)
    })

    it('should create tenant and user on successful signup', async () => {
      const mockSql = vi.fn().mockResolvedValue([])

      vi.mocked(dbModule.hasDatabaseConnection).mockReturnValue(true)
      vi.mocked(dbModule.getNeonClient).mockReturnValue(mockSql as any)
      const context = createMockContext()
      const { request, url } = createMockRequest('POST', '/api/auth/signup', {
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User',
        tenantName: 'New Company',
      })

      const result = await handleAuthRequest(request, context, url)

      expect(result?.status).toBe(200)
      expect(mockSql).toHaveBeenCalledTimes(3) // tenant, user, member inserts

      const cookie = result?.headers.get('Set-Cookie')
      expect(cookie).toContain('canvassing_session=')

      const body = await result?.json()
      expect(body.ok).toBe(true)
      expect(body.user.email).toBe('newuser@example.com')
      expect(body.user.fullName).toBe('New User')
      expect(body.user.role).toBe('owner')
      expect(body.tenant.name).toBe('New Company')
      expect(body.tenant.slug).toBe('new-company')
    })

    it('should generate correct slug from tenant name', async () => {
      const mockSql = vi.fn().mockResolvedValue([])

      vi.mocked(dbModule.hasDatabaseConnection).mockReturnValue(true)
      vi.mocked(dbModule.getNeonClient).mockReturnValue(mockSql as any)
      const context = createMockContext()
      const { request, url } = createMockRequest('POST', '/api/auth/signup', {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        tenantName: 'PT Jaya Makmur Sentosa',
      })

      const result = await handleAuthRequest(request, context, url)
      const body = await result?.json()

      expect(body.tenant.slug).toBe('pt-jaya-makmur-sentosa')
    })

    it('should return 409 for duplicate email', async () => {
      const mockSql = vi.fn().mockRejectedValue(new Error('duplicate key value violates unique constraint'))

      vi.mocked(dbModule.hasDatabaseConnection).mockReturnValue(true)
      vi.mocked(dbModule.getNeonClient).mockReturnValue(mockSql as any)
      const context = createMockContext()
      const { request, url } = createMockRequest('POST', '/api/auth/signup', {
        email: 'existing@example.com',
        password: 'password123',
        fullName: 'Test User',
        tenantName: 'Test Company',
      })

      const result = await handleAuthRequest(request, context, url)

      expect(result?.status).toBe(409)
      const body = await result?.json()
      expect(body.error).toContain('already exists')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should clear session cookie', async () => {
      const context = createMockContext({
        sub: 'user-123',
        tenant: 'tenant-456',
        role: 'owner',
        name: 'Test User',
        slug: 'test-company',
      })
      const { request, url } = createMockRequest('POST', '/api/auth/logout')

      const result = await handleAuthRequest(request, context, url)

      expect(result?.status).toBe(200)

      const cookie = result?.headers.get('Set-Cookie')
      expect(cookie).toContain('canvassing_session=')
      expect(cookie).toContain('Max-Age=0')

      const body = await result?.json()
      expect(body.ok).toBe(true)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return 401 for unauthenticated request', async () => {
      const context = createMockContext()
      const { request, url } = createMockRequest('GET', '/api/auth/me')

      const result = await handleAuthRequest(request, context, url)

      expect(result?.status).toBe(401)
      const body = await result?.json()
      expect(body.error).toBe('Not authenticated')
    })

    it('should return user info for authenticated request', async () => {
      const context = createMockContext({
        sub: 'user-123',
        tenant: 'tenant-456',
        email: 'test@example.com',
        role: 'admin',
        name: 'Test User',
        slug: 'test-company',
      })
      const { request, url } = createMockRequest('GET', '/api/auth/me')

      const result = await handleAuthRequest(request, context, url)

      expect(result?.status).toBe(200)
      const body = await result?.json()
      expect(body.ok).toBe(true)
      expect(body.user.id).toBe('user-123')
      expect(body.user.email).toBe('test@example.com')
      expect(body.user.role).toBe('admin')
    })
  })

  describe('POST /api/auth/mobile-login', () => {
    it('should return bearer token instead of cookie', async () => {
      const passwordHash = await sessionModule.hashPassword('correctPassword')

      vi.mocked(dbModule.hasDatabaseConnection).mockReturnValue(true)
      vi.mocked(dbModule.getNeonClient).mockReturnValue((() =>
        Promise.resolve([
          {
            id: 'user-123',
            email: 'test@example.com',
            phone: null,
            password_hash: passwordHash,
            full_name: 'Test User',
            tenant_id: 'tenant-456',
            role: 'sales',
            slug: 'test-company',
            tenant_name: 'Test Company',
          },
        ])) as any)
      const context = createMockContext()
      const { request, url } = createMockRequest('POST', '/api/auth/mobile-login', {
        email: 'test@example.com',
        password: 'correctPassword',
      })

      const result = await handleAuthRequest(request, context, url)

      expect(result?.status).toBe(200)

      // Should NOT set cookie
      expect(result?.headers.get('Set-Cookie')).toBeNull()

      const body = await result?.json()
      expect(body.ok).toBe(true)
      expect(body.token).toBeDefined()
      expect(typeof body.token).toBe('string')
      expect(body.token.split('.')).toHaveLength(3) // JWT format
    })

    it('should create token valid for 30 days', async () => {
      const passwordHash = await sessionModule.hashPassword('correctPassword')

      vi.mocked(dbModule.hasDatabaseConnection).mockReturnValue(true)
      vi.mocked(dbModule.getNeonClient).mockReturnValue((() =>
        Promise.resolve([
          {
            id: 'user-123',
            email: 'test@example.com',
            phone: null,
            password_hash: passwordHash,
            full_name: 'Test User',
            tenant_id: 'tenant-456',
            role: 'sales',
            slug: 'test-company',
            tenant_name: 'Test Company',
          },
        ])) as any)
      const context = createMockContext()
      const { request, url } = createMockRequest('POST', '/api/auth/mobile-login', {
        email: 'test@example.com',
        password: 'correctPassword',
      })

      const result = await handleAuthRequest(request, context, url)
      const body = await result?.json()

      // Verify token is valid
      const decoded = await sessionModule.verifySessionJWT(mockEnv.SESSION_SECRET, body.token)
      expect(decoded).not.toBeNull()
      expect(decoded?.sub).toBe('user-123')
    })
  })
})

describe('Auth Input Validation', () => {
  it('should validate email format', async () => {
    const context = createMockContext()
    const { request, url } = createMockRequest('POST', '/api/auth/login', {
      email: 'not-an-email',
      password: 'password123',
    })

    const result = await handleAuthRequest(request, context, url)

    expect(result?.status).toBe(400)
  })

  it('should accept valid Indonesian phone format', async () => {
    const passwordHash = await sessionModule.hashPassword('password123')

    vi.mocked(dbModule.hasDatabaseConnection).mockReturnValue(true)
    vi.mocked(dbModule.getNeonClient).mockReturnValue((() =>
      Promise.resolve([
        {
          id: 'user-123',
          email: null,
          phone: '081234567890',
          password_hash: passwordHash,
          full_name: 'Test User',
          tenant_id: 'tenant-456',
          role: 'sales',
          slug: 'test-company',
          tenant_name: 'Test Company',
        },
      ])) as any)
    const context = createMockContext()
    const { request, url } = createMockRequest('POST', '/api/auth/login', {
      phone: '081234567890',
      password: 'password123',
    })

    const result = await handleAuthRequest(request, context, url)

    expect(result?.status).toBe(200)
  })
})
