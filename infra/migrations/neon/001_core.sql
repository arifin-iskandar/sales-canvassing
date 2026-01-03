-- Migration 001: Core schema for Sales Canvassing
-- Creates: tenants, users, members, mobile_tokens, sessions

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Schema
CREATE SCHEMA IF NOT EXISTS app;

-- RLS helper functions
CREATE OR REPLACE FUNCTION app.current_tenant_id()
RETURNS UUID LANGUAGE plpgsql STABLE AS $$
DECLARE setting TEXT;
BEGIN
    BEGIN
        setting := current_setting('app.tenant_id', true);
    EXCEPTION WHEN others THEN
        RETURN NULL;
    END;
    IF setting IS NULL OR setting = '' THEN
        RETURN NULL;
    END IF;
    RETURN setting::uuid;
END;
$$;

CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS UUID LANGUAGE plpgsql STABLE AS $$
DECLARE setting TEXT;
BEGIN
    BEGIN
        setting := current_setting('app.user_id', true);
    EXCEPTION WHEN others THEN
        RETURN NULL;
    END;
    IF setting IS NULL OR setting = '' THEN
        RETURN NULL;
    END IF;
    RETURN setting::uuid;
END;
$$;

-- Tenants (companies)
CREATE TABLE IF NOT EXISTS app.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug CITEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    plan_id TEXT NOT NULL DEFAULT 'starter',
    settings JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON app.tenants(slug);

-- Users
CREATE TABLE IF NOT EXISTS app.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE,
    phone CITEXT UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT users_identifier_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON app.users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON app.users(phone) WHERE phone IS NOT NULL;

-- Members (user-tenant relationship with role)
CREATE TABLE IF NOT EXISTS app.members (
    tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'supervisor', 'sales', 'collector')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_members_user ON app.members(user_id);

-- Mobile auth tokens (for offline/token-based auth)
CREATE TABLE IF NOT EXISTS app.mobile_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    device_id TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_mobile_tokens_user ON app.mobile_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_tokens_hash ON app.mobile_tokens(token_hash);

-- Sessions (for web)
CREATE TABLE IF NOT EXISTS app.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON app.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON app.sessions(expires_at);

-- Enable RLS
ALTER TABLE app.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.mobile_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY tenants_select_self ON app.tenants
    FOR SELECT USING (id = app.current_tenant_id());

CREATE POLICY tenants_all_for_new ON app.tenants
    FOR ALL USING (true); -- Allow insert during signup

CREATE POLICY members_same_tenant ON app.members
    FOR ALL
    USING (tenant_id = app.current_tenant_id())
    WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY mobile_tokens_same_tenant ON app.mobile_tokens
    FOR ALL
    USING (tenant_id = app.current_tenant_id())
    WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY sessions_same_tenant ON app.sessions
    FOR ALL
    USING (tenant_id = app.current_tenant_id())
    WITH CHECK (tenant_id = app.current_tenant_id());

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION app.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenants_updated_at
    BEFORE UPDATE ON app.tenants
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON app.users
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();
