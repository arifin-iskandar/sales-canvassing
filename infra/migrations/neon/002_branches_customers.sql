-- Migration 002: Branches and Customers
-- Creates: branches, customers

-- Branches (sales territories/locations)
CREATE TABLE IF NOT EXISTS app.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    geofence_meters INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (tenant_id, code),
    CONSTRAINT branches_tenant_scope UNIQUE (id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_branches_tenant ON app.branches(tenant_id);

-- Customers
CREATE TABLE IF NOT EXISTS app.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
    branch_id UUID,
    customer_code TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    geofence_meters INTEGER DEFAULT 50,
    payment_terms_days INTEGER DEFAULT 30,
    credit_limit_minor BIGINT DEFAULT 0,
    current_balance_minor BIGINT DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (tenant_id, customer_code),
    CONSTRAINT customers_tenant_scope UNIQUE (id, tenant_id),
    CONSTRAINT customers_branch_scope FOREIGN KEY (branch_id, tenant_id)
        REFERENCES app.branches (id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant ON app.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_branch ON app.customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_code ON app.customers(tenant_id, customer_code);

-- Enable RLS
ALTER TABLE app.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY branches_same_tenant ON app.branches
    FOR ALL
    USING (tenant_id = app.current_tenant_id())
    WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY customers_same_tenant ON app.customers
    FOR ALL
    USING (tenant_id = app.current_tenant_id())
    WITH CHECK (tenant_id = app.current_tenant_id());

-- Triggers
CREATE TRIGGER branches_updated_at
    BEFORE UPDATE ON app.branches
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER customers_updated_at
    BEFORE UPDATE ON app.customers
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();
