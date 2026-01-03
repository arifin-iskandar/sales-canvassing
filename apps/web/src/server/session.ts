/**
 * JWT session management for web authentication
 */
import { SignJWT, jwtVerify } from 'jose'
import type { AppEnv, SessionSummary } from './env'

export const SESSION_COOKIE_NAME = 'canvassing_session'
export const SESSION_NONCE_COOKIE_NAME = 'canvassing_nonce'
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60 // 7 days

type SessionTokenClaims = SessionSummary & {
  jti?: string
}

/**
 * Create a new session JWT
 */
export async function createSessionJWT(
  secret: string,
  claims: SessionTokenClaims,
  maxAgeSeconds: number = SESSION_MAX_AGE_SECONDS,
): Promise<string> {
  const encoder = new TextEncoder()
  const secretKey = encoder.encode(secret)

  return await new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(secretKey)
}

/**
 * Verify and decode a session JWT
 */
export async function verifySessionJWT(
  secret: string,
  token: string,
): Promise<SessionSummary | null> {
  try {
    const encoder = new TextEncoder()
    const secretKey = encoder.encode(secret)
    const result = await jwtVerify(token, secretKey)
    return result.payload as SessionSummary
  } catch {
    return null
  }
}

/**
 * Read session from cookie header
 */
export async function readSessionFromCookie(
  env: AppEnv,
  cookieHeader: string,
): Promise<{ session: SessionSummary | null; nonce: string | null }> {
  const cookies = parseCookies(cookieHeader)
  const sessionToken = cookies[SESSION_COOKIE_NAME]
  const nonce = cookies[SESSION_NONCE_COOKIE_NAME] || null

  if (!sessionToken) {
    return { session: null, nonce }
  }

  const session = await verifySessionJWT(env.SESSION_SECRET, sessionToken)
  return { session, nonce }
}

/**
 * Create session cookie header
 */
export function createSessionCookie(
  token: string,
  maxAgeSeconds: number = SESSION_MAX_AGE_SECONDS,
): string {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`
}

/**
 * Create a cookie that clears the session
 */
export function createLogoutCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
}

/**
 * Parse cookies from header string
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  const pairs = cookieHeader.split(';')

  for (const pair of pairs) {
    const [name, ...valueParts] = pair.trim().split('=')
    if (name) {
      cookies[name] = valueParts.join('=')
    }
  }

  return cookies
}

/**
 * Hash a password using PBKDF2
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    256,
  )

  const hashArray = new Uint8Array(hash)
  const combined = new Uint8Array(salt.length + hashArray.length)
  combined.set(salt)
  combined.set(hashArray, salt.length)

  return btoa(String.fromCharCode(...combined))
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const combined = Uint8Array.from(atob(storedHash), (c) => c.charCodeAt(0))
    const salt = combined.slice(0, 16)
    const storedHashBytes = combined.slice(16)

    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    )

    const hash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      256,
    )

    const hashArray = new Uint8Array(hash)
    return hashArray.every((byte, i) => byte === storedHashBytes[i])
  } catch {
    return false
  }
}
