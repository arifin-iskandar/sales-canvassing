-- Migration 004: Invoices, Payments, and Products
-- Creates: products, invoices, invoice_items, payments, payment_allocations, promise_to_pay

-- Products (optional catalog for line-item invoices)
CREATE TABLE IF NOT EXISTS app.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'pcs',
    price_minor BIGINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_products_tenant ON app.products(tenant_id);

-- Invoices
CREATE TABLE IF NOT EXISTS app.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    created_by_user_id UUID NOT NULL,
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal_minor BIGINT NOT NULL DEFAULT 0,
    tax_minor BIGINT NOT NULL DEFAULT 0,
    total_minor BIGINT NOT NULL DEFAULT 0,
    paid_minor BIGINT NOT NULL DEFAULT 0,
    balance_minor BIGINT GENERATED ALWAYS AS (total_minor - paid_minor) STORED,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'
    )),
    photo_url TEXT, -- Photo of paper invoice
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, invoice_number),
    CONSTRAINT invoices_tenant_scope UNIQUE (id, tenant_id),
    CONSTRAINT invoices_customer_scope FOREIGN KEY (customer_id, tenant_id)
        REFERENCES app.customers (id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON app.invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON app.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON app.invoices(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON app.invoices(due_date)
    WHERE status NOT IN ('paid', 'cancelled');

-- Invoice Items (line items)
CREATE TABLE IF NOT EXISTS app.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES app.invoices(id) ON DELETE CASCADE,
    product_id UUID,
    description TEXT NOT NULL,
    quantity NUMERIC(12,4) NOT NULL DEFAULT 1,
    unit_price_minor BIGINT NOT NULL DEFAULT 0,
    line_total_minor BIGINT NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON app.invoice_items(invoice_id);

-- Payments
CREATE TABLE IF NOT EXISTS app.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    collected_by_user_id UUID NOT NULL,
    payment_number TEXT NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_minor BIGINT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN (
        'cash', 'transfer', 'check', 'giro', 'qris'
    )),
    reference_number TEXT,
    photo_url TEXT, -- Photo of receipt/proof
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'rejected', 'deposited'
    )),
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, payment_number),
    CONSTRAINT payments_tenant_scope UNIQUE (id, tenant_id),
    CONSTRAINT payments_customer_scope FOREIGN KEY (customer_id, tenant_id)
        REFERENCES app.customers (id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_payments_tenant ON app.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON app.payments(customer_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user ON app.payments(collected_by_user_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON app.payments(tenant_id, status);

-- Payment Allocations (which invoices a payment applies to)
CREATE TABLE IF NOT EXISTS app.payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES app.payments(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES app.invoices(id) ON DELETE CASCADE,
    allocated_minor BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_allocations_payment ON app.payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_invoice ON app.payment_allocations(invoice_id);

-- Promise to Pay (PTP)
CREATE TABLE IF NOT EXISTS app.promise_to_pay (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    invoice_id UUID,
    recorded_by_user_id UUID NOT NULL,
    promised_date DATE NOT NULL,
    promised_amount_minor BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'fulfilled', 'broken', 'cancelled'
    )),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ptp_customer_scope FOREIGN KEY (customer_id, tenant_id)
        REFERENCES app.customers (id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_ptp_tenant ON app.promise_to_pay(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ptp_customer ON app.promise_to_pay(customer_id);
CREATE INDEX IF NOT EXISTS idx_ptp_promised_date ON app.promise_to_pay(promised_date)
    WHERE status = 'pending';

-- Enable RLS
ALTER TABLE app.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.promise_to_pay ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY products_same_tenant ON app.products
    FOR ALL
    USING (tenant_id = app.current_tenant_id())
    WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY invoices_same_tenant ON app.invoices
    FOR ALL
    USING (tenant_id = app.current_tenant_id())
    WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY invoice_items_via_invoice ON app.invoice_items
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM app.invoices i
        WHERE i.id = invoice_id AND i.tenant_id = app.current_tenant_id()
    ));

CREATE POLICY payments_same_tenant ON app.payments
    FOR ALL
    USING (tenant_id = app.current_tenant_id())
    WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY payment_allocations_via_payment ON app.payment_allocations
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM app.payments p
        WHERE p.id = payment_id AND p.tenant_id = app.current_tenant_id()
    ));

CREATE POLICY ptp_same_tenant ON app.promise_to_pay
    FOR ALL
    USING (tenant_id = app.current_tenant_id())
    WITH CHECK (tenant_id = app.current_tenant_id());

-- Triggers
CREATE TRIGGER products_updated_at
    BEFORE UPDATE ON app.products
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER invoices_updated_at
    BEFORE UPDATE ON app.invoices
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER payments_updated_at
    BEFORE UPDATE ON app.payments
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER ptp_updated_at
    BEFORE UPDATE ON app.promise_to_pay
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at();

-- Function to update invoice paid_minor from allocations
CREATE OR REPLACE FUNCTION app.update_invoice_paid()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE app.invoices
    SET paid_minor = COALESCE((
        SELECT SUM(allocated_minor)
        FROM app.payment_allocations
        WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    ), 0)
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    -- Update status based on payment
    UPDATE app.invoices
    SET status = CASE
        WHEN paid_minor >= total_minor THEN 'paid'
        WHEN paid_minor > 0 THEN 'partial'
        WHEN due_date < CURRENT_DATE THEN 'overdue'
        ELSE status
    END
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id)
      AND status NOT IN ('cancelled', 'draft');

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_allocations_update_invoice
    AFTER INSERT OR UPDATE OR DELETE ON app.payment_allocations
    FOR EACH ROW EXECUTE FUNCTION app.update_invoice_paid();

-- Function to update customer balance from invoices
CREATE OR REPLACE FUNCTION app.update_customer_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE app.customers
    SET current_balance_minor = COALESCE((
        SELECT SUM(balance_minor)
        FROM app.invoices
        WHERE customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
          AND status NOT IN ('cancelled', 'draft')
    ), 0)
    WHERE id = COALESCE(NEW.customer_id, OLD.customer_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoices_update_customer_balance
    AFTER INSERT OR UPDATE OR DELETE ON app.invoices
    FOR EACH ROW EXECUTE FUNCTION app.update_customer_balance();
