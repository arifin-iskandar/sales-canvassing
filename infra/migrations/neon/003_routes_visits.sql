-- Migration 003: Routes and Visits
-- Creates: routes, route_stops, visit_events

-- Routes (PJP - Perjalanan Jual Produk)
CREATE TABLE IF NOT EXISTS app.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    assigned_user_id UUID,
    effective_date DATE NOT NULL,
    day_of_week INTEGER, -- 0=Sunday, 6=Saturday (null = specific date only)
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT routes_tenant_scope UNIQUE (id, tenant_id),
    CONSTRAINT routes_user_scope FOREIGN KEY (assigned_user_id, tenant_id)
        REFERENCES app.members (user_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_routes_tenant ON app.routes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_routes_user_date ON app.routes(assigned_user_id, effective_date);
CREATE INDEX IF NOT EXISTS idx_routes_day ON app.routes(day_of_week) WHERE day_of_week IS NOT NULL;

-- Route Stops (ordered customer visits within a route)
CREATE TABLE IF NOT EXISTS app.route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
    route_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    sequence_order INTEGER NOT NULL,
    notes TEXT,
    CONSTRAINT route_stops_route_scope FOREIGN KEY (route_id, tenant_id)
        REFERENCES app.routes (id, tenant_id) ON DELETE CASCADE,
    CONSTRAINT route_stops_customer_scope FOREIGN KEY (customer_id, tenant_id)
        REFERENCES app.customers (id, tenant_id),
    UNIQUE (route_id, sequence_order)
);

CREATE INDEX IF NOT EXISTS idx_route_stops_route ON app.route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_customer ON app.route_stops(customer_id);

-- Visit Events (append-only audit log of field activities)
CREATE TABLE IF NOT EXISTS app.visit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    user_id UUID NOT NULL,
    route_id UUID,
    route_stop_id UUID,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'check_in', 'check_out', 'photo_captured',
        'order_created', 'payment_collected', 'ptp_recorded', 'note_added'
    )),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    accuracy_meters NUMERIC(8,2),
    is_within_geofence BOOLEAN,
    distance_from_customer_meters NUMERIC(10,2),
    photo_url TEXT,
    notes TEXT,
    outcome_code TEXT, -- met_owner, closed, no_cash, dispute, etc.
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    device_id TEXT,
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    client_event_id TEXT, -- For offline sync idempotency
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT visit_events_customer_scope FOREIGN KEY (customer_id, tenant_id)
        REFERENCES app.customers (id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_visit_events_tenant ON app.visit_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_visit_events_customer ON app.visit_events(customer_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_visit_events_user_date ON app.visit_events(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_visit_events_route ON app.visit_events(route_id) WHERE route_id IS NOT NULL;

-- Idempotency index for offline sync
CREATE UNIQUE INDEX IF NOT EXISTS idx_visit_events_idempotency
    ON app.visit_events(client_event_id)
    WHERE client_event_id IS NOT NULL;

-- Enable RLS
ALTER TABLE app.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.visit_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY routes_same_tenant ON app.routes
    FOR ALL
    USING (tenant_id = app.current_tenant_id())
    WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY route_stops_same_tenant ON app.route_stops
    FOR ALL
    USING (tenant_id = app.current_tenant_id())
    WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY visit_events_same_tenant ON app.visit_events
    FOR ALL
    USING (tenant_id = app.current_tenant_id())
    WITH CHECK (tenant_id = app.current_tenant_id());

-- Triggers
CREATE TRIGGER routes_updated_at
    BEFORE UPDATE ON app.routes
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();
