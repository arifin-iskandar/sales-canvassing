import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createSessionJWT,
  verifySessionJWT,
  createSessionCookie,
  createLogoutCookie,
  readSessionFromCookie,
  hashPassword,
  verifyPassword,
  SESSION_COOKIE_NAME,
} from '../session'
import type { AppEnv } from '../env'

// Mock environment
const mockEnv: AppEnv = {
  SESSION_SECRET: 'test-secret-key-minimum-16-chars',
  APP_ENV: 'development',
  DATABASE_URL: 'mock://database',
}

describe('JWT Session Management', () => {
  describe('createSessionJWT', () => {
    it('should create a valid JWT token', async () => {
      const claims = {
        sub: 'user-123',
        tenant: 'tenant-456',
        email: 'test@example.com',
        role: 'owner' as const,
        name: 'Test User',
        slug: 'test-company',
      }

      const token = await createSessionJWT(mockEnv.SESSION_SECRET, claims)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should include claims in the token payload', async () => {
      const claims = {
        sub: 'user-123',
        tenant: 'tenant-456',
        email: 'test@example.com',
        role: 'admin' as const,
        name: 'Admin User',
        slug: 'admin-company',
      }

      const token = await createSessionJWT(mockEnv.SESSION_SECRET, claims)
      const decoded = await verifySessionJWT(mockEnv.SESSION_SECRET, token)

      expect(decoded).not.toBeNull()
      expect(decoded?.sub).toBe(claims.sub)
      expect(decoded?.tenant).toBe(claims.tenant)
      expect(decoded?.email).toBe(claims.email)
      expect(decoded?.role).toBe(claims.role)
    })

    it('should set custom max age', async () => {
      const claims = {
        sub: 'user-123',
        tenant: 'tenant-456',
        role: 'sales' as const,
        name: 'Sales User',
        slug: 'sales-company',
      }

      // Create with short expiry (1 second)
      const token = await createSessionJWT(mockEnv.SESSION_SECRET, claims, 1)

      // Wait for expiry
      await new Promise((resolve) => setTimeout(resolve, 1100))

      const decoded = await verifySessionJWT(mockEnv.SESSION_SECRET, token)
      expect(decoded).toBeNull() // Should be expired
    })
  })

  describe('verifySessionJWT', () => {
    it('should verify a valid token', async () => {
      const claims = {
        sub: 'user-123',
        tenant: 'tenant-456',
        email: 'test@example.com',
        role: 'owner' as const,
        name: 'Test User',
        slug: 'test-company',
      }

      const token = await createSessionJWT(mockEnv.SESSION_SECRET, claims)
      const decoded = await verifySessionJWT(mockEnv.SESSION_SECRET, token)

      expect(decoded).not.toBeNull()
      expect(decoded?.sub).toBe(claims.sub)
    })

    it('should return null for invalid token', async () => {
      const decoded = await verifySessionJWT(mockEnv.SESSION_SECRET, 'invalid-token')
      expect(decoded).toBeNull()
    })

    it('should return null for token signed with wrong secret', async () => {
      const claims = {
        sub: 'user-123',
        tenant: 'tenant-456',
        role: 'owner' as const,
        name: 'Test User',
        slug: 'test-company',
      }

      const token = await createSessionJWT('different-secret-key-min-16', claims)
      const decoded = await verifySessionJWT(mockEnv.SESSION_SECRET, token)

      expect(decoded).toBeNull()
    })

    it('should return null for malformed JWT', async () => {
      const decoded = await verifySessionJWT(mockEnv.SESSION_SECRET, 'not.a.valid.jwt')
      expect(decoded).toBeNull()
    })
  })

  describe('readSessionFromCookie', () => {
    it('should extract session from cookie header', async () => {
      const claims = {
        sub: 'user-123',
        tenant: 'tenant-456',
        email: 'test@example.com',
        role: 'owner' as const,
        name: 'Test User',
        slug: 'test-company',
      }

      const token = await createSessionJWT(mockEnv.SESSION_SECRET, claims)
      const cookieHeader = `${SESSION_COOKIE_NAME}=${token}`

      const result = await readSessionFromCookie(mockEnv, cookieHeader)

      expect(result.session).not.toBeNull()
      expect(result.session?.sub).toBe(claims.sub)
    })

    it('should handle multiple cookies', async () => {
      const claims = {
        sub: 'user-123',
        tenant: 'tenant-456',
        role: 'owner' as const,
        name: 'Test User',
        slug: 'test-company',
      }

      const token = await createSessionJWT(mockEnv.SESSION_SECRET, claims)
      const cookieHeader = `other_cookie=value; ${SESSION_COOKIE_NAME}=${token}; another=value`

      const result = await readSessionFromCookie(mockEnv, cookieHeader)

      expect(result.session).not.toBeNull()
      expect(result.session?.sub).toBe(claims.sub)
    })

    it('should return null session for missing cookie', async () => {
      const result = await readSessionFromCookie(mockEnv, 'other_cookie=value')
      expect(result.session).toBeNull()
    })

    it('should return null session for invalid token in cookie', async () => {
      const cookieHeader = `${SESSION_COOKIE_NAME}=invalid-token`
      const result = await readSessionFromCookie(mockEnv, cookieHeader)
      expect(result.session).toBeNull()
    })

    it('should extract nonce cookie', async () => {
      const claims = {
        sub: 'user-123',
        tenant: 'tenant-456',
        role: 'owner' as const,
        name: 'Test User',
        slug: 'test-company',
      }

      const token = await createSessionJWT(mockEnv.SESSION_SECRET, claims)
      const cookieHeader = `${SESSION_COOKIE_NAME}=${token}; canvassing_nonce=test-nonce-value`

      const result = await readSessionFromCookie(mockEnv, cookieHeader)

      expect(result.nonce).toBe('test-nonce-value')
    })
  })
})

describe('Session Cookie Creation', () => {
  describe('createSessionCookie', () => {
    it('should create HttpOnly secure cookie', () => {
      const cookie = createSessionCookie('test-token')

      expect(cookie).toContain(`${SESSION_COOKIE_NAME}=test-token`)
      expect(cookie).toContain('HttpOnly')
      expect(cookie).toContain('Secure')
      expect(cookie).toContain('SameSite=Lax')
      expect(cookie).toContain('Path=/')
    })

    it('should include default max age (7 days)', () => {
      const cookie = createSessionCookie('test-token')
      const sevenDaysInSeconds = 7 * 24 * 60 * 60

      expect(cookie).toContain(`Max-Age=${sevenDaysInSeconds}`)
    })

    it('should use custom max age', () => {
      const customMaxAge = 3600 // 1 hour
      const cookie = createSessionCookie('test-token', customMaxAge)

      expect(cookie).toContain(`Max-Age=${customMaxAge}`)
    })
  })

  describe('createLogoutCookie', () => {
    it('should create cookie that clears session', () => {
      const cookie = createLogoutCookie()

      expect(cookie).toContain(`${SESSION_COOKIE_NAME}=`)
      expect(cookie).toContain('Max-Age=0')
      expect(cookie).toContain('HttpOnly')
      expect(cookie).toContain('Secure')
    })
  })
})

describe('Password Hashing', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123!'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash).not.toBe(password) // Hash should differ from plain password
    })

    it('should generate different hashes for same password (salted)', async () => {
      const password = 'testPassword123!'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2) // Different salts should produce different hashes
    })

    it('should handle special characters', async () => {
      const password = 'p@$$w0rd!@#$%^&*()'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should handle unicode characters', async () => {
      const password = 'パスワード123'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      const verified = await verifyPassword(password, hash)
      expect(verified).toBe(true)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'correctPassword123!'
      const hash = await hashPassword(password)

      const result = await verifyPassword(password, hash)

      expect(result).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'correctPassword123!'
      const hash = await hashPassword(password)

      const result = await verifyPassword('wrongPassword', hash)

      expect(result).toBe(false)
    })

    it('should reject empty password', async () => {
      const hash = await hashPassword('somePassword')

      const result = await verifyPassword('', hash)

      expect(result).toBe(false)
    })

    it('should handle invalid hash format', async () => {
      const result = await verifyPassword('password', 'invalid-hash-format')

      expect(result).toBe(false)
    })

    it('should handle corrupted hash', async () => {
      const result = await verifyPassword('password', 'YWJjZGVm') // short base64

      expect(result).toBe(false)
    })

    it('should be case-sensitive', async () => {
      const password = 'CaseSensitive123'
      const hash = await hashPassword(password)

      expect(await verifyPassword('CaseSensitive123', hash)).toBe(true)
      expect(await verifyPassword('casesensitive123', hash)).toBe(false)
      expect(await verifyPassword('CASESENSITIVE123', hash)).toBe(false)
    })
  })

  describe('password hash roundtrip', () => {
    it('should work for various password lengths', async () => {
      const passwords = [
        'short1',
        'mediumPassword123',
        'aVeryLongPasswordThatExceedsNormalLength1234567890!@#$%',
      ]

      for (const password of passwords) {
        const hash = await hashPassword(password)
        const verified = await verifyPassword(password, hash)
        expect(verified).toBe(true)
      }
    })
  })
})

describe('Session Role Types', () => {
  const roles = ['owner', 'admin', 'supervisor', 'sales', 'collector'] as const

  for (const role of roles) {
    it(`should handle ${role} role in session`, async () => {
      const claims = {
        sub: 'user-123',
        tenant: 'tenant-456',
        role,
        name: 'Test User',
        slug: 'test-company',
      }

      const token = await createSessionJWT(mockEnv.SESSION_SECRET, claims)
      const decoded = await verifySessionJWT(mockEnv.SESSION_SECRET, token)

      expect(decoded?.role).toBe(role)
    })
  }
})
