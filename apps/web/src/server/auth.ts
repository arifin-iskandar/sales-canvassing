/**
 * Authentication API handlers
 */
import type { AppServerContext } from './env'
import { getNeonClient, hasDatabaseConnection } from '@canvassing/db'
import {
  createSessionJWT,
  createSessionCookie,
  createLogoutCookie,
  hashPassword,
  verifyPassword,
} from './session'
import { jsonResponse, parseJsonBody } from './http'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
})

const signupSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  tenantName: z.string().min(2),
})

export async function handleAuthRequest(
  request: Request,
  context: AppServerContext,
  url: URL,
): Promise<Response | null> {
  const path = url.pathname

  if (path === '/api/auth/login' && request.method === 'POST') {
    return handleLogin(request, context)
  }

  if (path === '/api/auth/signup' && request.method === 'POST') {
    return handleSignup(request, context)
  }

  if (path === '/api/auth/logout' && request.method === 'POST') {
    return handleLogout(request, context)
  }

  if (path === '/api/auth/me' && request.method === 'GET') {
    return handleMe(request, context)
  }

  if (path === '/api/auth/mobile-login' && request.method === 'POST') {
    return handleMobileLogin(request, context)
  }

  return null
}

async function handleLogin(
  request: Request,
  context: AppServerContext,
): Promise<Response> {
  const body = await parseJsonBody<unknown>(request)
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return jsonResponse(request, context.env, {
      ok: false,
      error: 'Invalid input',
      details: parsed.error.flatten(),
    }, { status: 400 })
  }

  const { email, phone, password } = parsed.data

  if (!email && !phone) {
    return jsonResponse(request, context.env, {
      ok: false,
      error: 'Email or phone required',
    }, { status: 400 })
  }

  if (!hasDatabaseConnection(context.env)) {
    return jsonResponse(request, context.env, {
      ok: false,
      error: 'Database not configured',
    }, { status: 503 })
  }

  const sql = getNeonClient(context.env)

  // Find user by email or phone
  const users = email
    ? await sql`
        SELECT u.id, u.email, u.phone, u.password_hash, u.full_name,
               m.tenant_id, m.role, t.slug, t.name as tenant_name
        FROM app.users u
        JOIN app.members m ON m.user_id = u.id
        JOIN app.tenants t ON t.id = m.tenant_id
        WHERE u.email = ${email}
        LIMIT 1
      `
    : await sql`
        SELECT u.id, u.email, u.phone, u.password_hash, u.full_name,
               m.tenant_id, m.role, t.slug, t.name as tenant_name
        FROM app.users u
        JOIN app.members m ON m.user_id = u.id
        JOIN app.tenants t ON t.id = m.tenant_id
        WHERE u.phone = ${phone}
        LIMIT 1
      `

  const user = users[0]
  if (!user) {
    return jsonResponse(request, context.env, {
      ok: false,
      error: 'Invalid credentials',
    }, { status: 401 })
  }

  const passwordValid = await verifyPassword(password, user.password_hash)
  if (!passwordValid) {
    return jsonResponse(request, context.env, {
      ok: false,
      error: 'Invalid credentials',
    }, { status: 401 })
  }

  // Create session JWT
  const token = await createSessionJWT(context.env.SESSION_SECRET, {
    sub: user.id,
    tenant: user.tenant_id,
    email: user.email || undefined,
    phone: user.phone || undefined,
    role: user.role,
    name: user.full_name,
    slug: user.slug,
  })

  const cookie = createSessionCookie(token)

  return jsonResponse(
    request,
    context.env,
    {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.full_name,
        role: user.role,
      },
      tenant: {
        id: user.tenant_id,
        slug: user.slug,
        name: user.tenant_name,
      },
    },
    {
      headers: {
        'Set-Cookie': cookie,
      },
    },
  )
}

async function handleSignup(
  request: Request,
  context: AppServerContext,
): Promise<Response> {
  const body = await parseJsonBody<unknown>(request)
  const parsed = signupSchema.safeParse(body)

  if (!parsed.success) {
    return jsonResponse(request, context.env, {
      ok: false,
      error: 'Invalid input',
      details: parsed.error.flatten(),
    }, { status: 400 })
  }

  const { email, phone, password, fullName, tenantName } = parsed.data

  if (!email && !phone) {
    return jsonResponse(request, context.env, {
      ok: false,
      error: 'Email or phone required',
    }, { status: 400 })
  }

  if (!hasDatabaseConnection(context.env)) {
    return jsonResponse(request, context.env, {
      ok: false,
      error: 'Database not configured',
    }, { status: 503 })
  }

  const sql = getNeonClient(context.env)
  const passwordHash = await hashPassword(password)

  // Generate slug from tenant name
  const slug = tenantName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  try {
    // Create tenant, user, and membership in a transaction
    const userId = crypto.randomUUID()
    const tenantId = crypto.randomUUID()

    await sql`
      INSERT INTO app.tenants (id, slug, name)
      VALUES (${tenantId}::uuid, ${slug}, ${tenantName})
    `

    await sql`
      INSERT INTO app.users (id, email, phone, password_hash, full_name)
      VALUES (${userId}::uuid, ${email || null}, ${phone || null}, ${passwordHash}, ${fullName})
    `

    await sql`
      INSERT INTO app.members (tenant_id, user_id, role)
      VALUES (${tenantId}::uuid, ${userId}::uuid, 'owner')
    `

    // Create session JWT
    const token = await createSessionJWT(context.env.SESSION_SECRET, {
      sub: userId,
      tenant: tenantId,
      email: email || undefined,
      phone: phone || undefined,
      role: 'owner',
      name: fullName,
      slug,
    })

    const cookie = createSessionCookie(token)

    return jsonResponse(
      request,
      context.env,
      {
        ok: true,
        user: {
          id: userId,
          email,
          phone,
          fullName,
          role: 'owner',
        },
        tenant: {
          id: tenantId,
          slug,
          name: tenantName,
        },
      },
      {
        headers: {
          'Set-Cookie': cookie,
        },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Signup failed'
    const isDuplicate = message.includes('duplicate') || message.includes('unique')

    return jsonResponse(request, context.env, {
      ok: false,
      error: isDuplicate ? 'Email, phone, or company name already exists' : message,
    }, { status: isDuplicate ? 409 : 500 })
  }
}

async function handleLogout(
  request: Request,
  context: AppServerContext,
): Promise<Response> {
  const cookie = createLogoutCookie()

  return jsonResponse(
    request,
    context.env,
    { ok: true },
    {
      headers: {
        'Set-Cookie': cookie,
      },
    },
  )
}

async function handleMe(
  request: Request,
  context: AppServerContext,
): Promise<Response> {
  if (!context.session) {
    return jsonResponse(request, context.env, {
      ok: false,
      error: 'Not authenticated',
    }, { status: 401 })
  }

  return jsonResponse(request, context.env, {
    ok: true,
    user: {
      id: context.session.sub,
      email: context.session.email,
      phone: context.session.phone,
      name: context.session.name,
      role: context.session.role,
    },
    tenant: context.tenant || {
      id: context.session.tenant,
      slug: context.session.slug,
    },
  })
}

async function handleMobileLogin(
  request: Request,
  context: AppServerContext,
): Promise<Response> {
  // Same as login but returns a bearer token instead of cookie
  const body = await parseJsonBody<unknown>(request)
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return jsonResponse(request, context.env, {
      ok: false,
      error: 'Invalid input',
    }, { status: 400 })
  }

  const { email, phone, password } = parsed.data

  if (!email && !phone) {
    return jsonResponse(request, context.env, {
      ok: false,
      error: 'Email or phone required',
    }, { status: 400 })
  }

  if (!hasDatabaseConnection(context.env)) {
    return jsonResponse(request, context.env, {
      ok: false,
      error: 'Database not configured',
    }, { status: 503 })
  }

  const sql = getNeonClient(context.env)

  const users = email
    ? await sql`
        SELECT u.id, u.email, u.phone, u.password_hash, u.full_name,
               m.tenant_id, m.role, t.slug, t.name as tenant_name
        FROM app.users u
        JOIN app.members m ON m.user_id = u.id
        JOIN app.tenants t ON t.id = m.tenant_id
        WHERE u.email = ${email}
        LIMIT 1
      `
    : await sql`
        SELECT u.id, u.email, u.phone, u.password_hash, u.full_name,
               m.tenant_id, m.role, t.slug, t.name as tenant_name
        FROM app.users u
        JOIN app.members m ON m.user_id = u.id
        JOIN app.tenants t ON t.id = m.tenant_id
        WHERE u.phone = ${phone}
        LIMIT 1
      `

  const user = users[0]
  if (!user) {
    return jsonResponse(request, context.env, {
      ok: false,
      error: 'Invalid credentials',
    }, { status: 401 })
  }

  const passwordValid = await verifyPassword(password, user.password_hash)
  if (!passwordValid) {
    return jsonResponse(request, context.env, {
      ok: false,
      error: 'Invalid credentials',
    }, { status: 401 })
  }

  // Create a longer-lived token for mobile (30 days)
  const token = await createSessionJWT(
    context.env.SESSION_SECRET,
    {
      sub: user.id,
      tenant: user.tenant_id,
      email: user.email || undefined,
      phone: user.phone || undefined,
      role: user.role,
      name: user.full_name,
      slug: user.slug,
    },
    30 * 24 * 60 * 60, // 30 days
  )

  return jsonResponse(request, context.env, {
    ok: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.full_name,
      role: user.role,
    },
    tenant: {
      id: user.tenant_id,
      slug: user.slug,
      name: user.tenant_name,
    },
  })
}
