-- Demo seed data for Sales Canvassing + Collection Tracker
-- Run with: psql "$DATABASE_URL" -f seeds/demo.sql

-- Use a transaction to ensure atomicity
BEGIN;

-- Create demo tenant
INSERT INTO app.tenants (id, slug, name)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'demo-distributor',
  'PT Demo Distributor'
) ON CONFLICT (id) DO NOTHING;

-- Create demo users (password is 'password123' - hashed with PBKDF2)
-- Note: In production, use proper password hashing
INSERT INTO app.users (id, email, phone, password_hash, full_name)
VALUES
  ('22222222-2222-2222-2222-222222222222'::uuid, 'owner@demo.com', '+6281111111111',
   'NzTgZPqNQ9+W4k8YcWNL9rp5nOWD0Ue0GpMwKiV8L+wNKJL3Ng==', 'Budi Santoso'),
  ('22222222-2222-2222-2222-222222222223'::uuid, 'admin@demo.com', '+6281111111112',
   'NzTgZPqNQ9+W4k8YcWNL9rp5nOWD0Ue0GpMwKiV8L+wNKJL3Ng==', 'Siti Rahayu'),
  ('22222222-2222-2222-2222-222222222224'::uuid, 'supervisor@demo.com', '+6281111111113',
   'NzTgZPqNQ9+W4k8YcWNL9rp5nOWD0Ue0GpMwKiV8L+wNKJL3Ng==', 'Agus Wijaya'),
  ('22222222-2222-2222-2222-222222222225'::uuid, 'sales1@demo.com', '+6281111111114',
   'NzTgZPqNQ9+W4k8YcWNL9rp5nOWD0Ue0GpMwKiV8L+wNKJL3Ng==', 'Dewi Lestari'),
  ('22222222-2222-2222-2222-222222222226'::uuid, 'sales2@demo.com', '+6281111111115',
   'NzTgZPqNQ9+W4k8YcWNL9rp5nOWD0Ue0GpMwKiV8L+wNKJL3Ng==', 'Rizki Pratama'),
  ('22222222-2222-2222-2222-222222222227'::uuid, 'collector@demo.com', '+6281111111116',
   'NzTgZPqNQ9+W4k8YcWNL9rp5nOWD0Ue0GpMwKiV8L+wNKJL3Ng==', 'Eka Putra')
ON CONFLICT (id) DO NOTHING;

-- Create memberships with roles
INSERT INTO app.members (tenant_id, user_id, role)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'owner'),
  ('11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222223'::uuid, 'admin'),
  ('11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222224'::uuid, 'supervisor'),
  ('11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222225'::uuid, 'sales'),
  ('11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222226'::uuid, 'sales'),
  ('11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222227'::uuid, 'collector')
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- Create demo branches
INSERT INTO app.branches (id, tenant_id, code, name, address, phone)
VALUES
  ('33333333-3333-3333-3333-333333333331'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   'JKT-SEL', 'Jakarta Selatan', 'Jl. TB Simatupang No. 1', '+6221111111'),
  ('33333333-3333-3333-3333-333333333332'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   'JKT-TIM', 'Jakarta Timur', 'Jl. Pemuda No. 25', '+6221222222'),
  ('33333333-3333-3333-3333-333333333333'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   'JKT-BAR', 'Jakarta Barat', 'Jl. Kebon Jeruk No. 10', '+6221333333')
ON CONFLICT (id) DO NOTHING;

-- Create demo customers in Jakarta Selatan
INSERT INTO app.customers (id, tenant_id, branch_id, code, name, address, phone, latitude, longitude, geofence_meters)
VALUES
  ('44444444-4444-4444-4444-444444444401'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '33333333-3333-3333-3333-333333333331'::uuid, 'CUST-001', 'Toko Maju Jaya',
   'Jl. Raya Fatmawati No. 123', '+6281234567801', -6.2920, 106.7937, 50),
  ('44444444-4444-4444-4444-444444444402'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '33333333-3333-3333-3333-333333333331'::uuid, 'CUST-002', 'Warung Berkah',
   'Jl. Radio Dalam No. 45', '+6281234567802', -6.2555, 106.7890, 50),
  ('44444444-4444-4444-4444-444444444403'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '33333333-3333-3333-3333-333333333331'::uuid, 'CUST-003', 'Minimarket Sinar',
   'Jl. Kemang Raya No. 88', '+6281234567803', -6.2631, 106.8111, 50),
  ('44444444-4444-4444-4444-444444444404'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '33333333-3333-3333-3333-333333333331'::uuid, 'CUST-004', 'Toko Sembako Makmur',
   'Jl. Cilandak Tengah No. 15', '+6281234567804', -6.2855, 106.7988, 50)
ON CONFLICT (id) DO NOTHING;

-- Create demo customers in Jakarta Timur
INSERT INTO app.customers (id, tenant_id, branch_id, code, name, address, phone, latitude, longitude, geofence_meters)
VALUES
  ('44444444-4444-4444-4444-444444444411'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '33333333-3333-3333-3333-333333333332'::uuid, 'CUST-011', 'Toko Abadi',
   'Jl. Raya Bekasi Timur No. 100', '+6281234567811', -6.2277, 106.9716, 50),
  ('44444444-4444-4444-4444-444444444412'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '33333333-3333-3333-3333-333333333332'::uuid, 'CUST-012', 'Warung Sederhana',
   'Jl. Cipinang Muara No. 33', '+6281234567812', -6.2196, 106.8750, 50),
  ('44444444-4444-4444-4444-444444444413'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '33333333-3333-3333-3333-333333333332'::uuid, 'CUST-013', 'Kios Bahagia',
   'Jl. Jatinegara Barat No. 55', '+6281234567813', -6.2140, 106.8699, 50)
ON CONFLICT (id) DO NOTHING;

-- Create demo customers in Jakarta Barat
INSERT INTO app.customers (id, tenant_id, branch_id, code, name, address, phone, latitude, longitude, geofence_meters)
VALUES
  ('44444444-4444-4444-4444-444444444421'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '33333333-3333-3333-3333-333333333333'::uuid, 'CUST-021', 'Toko Rejeki',
   'Jl. Daan Mogot No. 200', '+6281234567821', -6.1688, 106.7405, 50),
  ('44444444-4444-4444-4444-444444444422'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '33333333-3333-3333-3333-333333333333'::uuid, 'CUST-022', 'Warung Segar',
   'Jl. Kebon Jeruk Raya No. 77', '+6281234567822', -6.1900, 106.7633, 50)
ON CONFLICT (id) DO NOTHING;

-- Create demo products
INSERT INTO app.products (id, tenant_id, sku, name, unit, price_minor)
VALUES
  ('55555555-5555-5555-5555-555555555501'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   'PRD-001', 'Minyak Goreng 1L', 'botol', 28000),
  ('55555555-5555-5555-5555-555555555502'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   'PRD-002', 'Beras Premium 5kg', 'karung', 75000),
  ('55555555-5555-5555-5555-555555555503'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   'PRD-003', 'Gula Pasir 1kg', 'pack', 18000),
  ('55555555-5555-5555-5555-555555555504'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   'PRD-004', 'Tepung Terigu 1kg', 'pack', 15000),
  ('55555555-5555-5555-5555-555555555505'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   'PRD-005', 'Kopi Sachet (isi 10)', 'renceng', 25000)
ON CONFLICT (id) DO NOTHING;

-- Create demo routes for Jakarta Selatan (Monday route)
INSERT INTO app.routes (id, tenant_id, name, assigned_user_id, day_of_week, is_active)
VALUES
  ('66666666-6666-6666-6666-666666666601'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   'Rute Senin - Jakarta Selatan', '22222222-2222-2222-2222-222222222225'::uuid, 1, true),
  ('66666666-6666-6666-6666-666666666602'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   'Rute Selasa - Jakarta Timur', '22222222-2222-2222-2222-222222222225'::uuid, 2, true),
  ('66666666-6666-6666-6666-666666666603'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   'Rute Rabu - Jakarta Barat', '22222222-2222-2222-2222-222222222226'::uuid, 3, true)
ON CONFLICT (id) DO NOTHING;

-- Create route stops for Monday route
INSERT INTO app.route_stops (id, route_id, customer_id, sequence)
VALUES
  ('77777777-7777-7777-7777-777777777701'::uuid, '66666666-6666-6666-6666-666666666601'::uuid,
   '44444444-4444-4444-4444-444444444401'::uuid, 1),
  ('77777777-7777-7777-7777-777777777702'::uuid, '66666666-6666-6666-6666-666666666601'::uuid,
   '44444444-4444-4444-4444-444444444402'::uuid, 2),
  ('77777777-7777-7777-7777-777777777703'::uuid, '66666666-6666-6666-6666-666666666601'::uuid,
   '44444444-4444-4444-4444-444444444403'::uuid, 3),
  ('77777777-7777-7777-7777-777777777704'::uuid, '66666666-6666-6666-6666-666666666601'::uuid,
   '44444444-4444-4444-4444-444444444404'::uuid, 4)
ON CONFLICT (id) DO NOTHING;

-- Create route stops for Tuesday route
INSERT INTO app.route_stops (id, route_id, customer_id, sequence)
VALUES
  ('77777777-7777-7777-7777-777777777711'::uuid, '66666666-6666-6666-6666-666666666602'::uuid,
   '44444444-4444-4444-4444-444444444411'::uuid, 1),
  ('77777777-7777-7777-7777-777777777712'::uuid, '66666666-6666-6666-6666-666666666602'::uuid,
   '44444444-4444-4444-4444-444444444412'::uuid, 2),
  ('77777777-7777-7777-7777-777777777713'::uuid, '66666666-6666-6666-6666-666666666602'::uuid,
   '44444444-4444-4444-4444-444444444413'::uuid, 3)
ON CONFLICT (id) DO NOTHING;

-- Create route stops for Wednesday route
INSERT INTO app.route_stops (id, route_id, customer_id, sequence)
VALUES
  ('77777777-7777-7777-7777-777777777721'::uuid, '66666666-6666-6666-6666-666666666603'::uuid,
   '44444444-4444-4444-4444-444444444421'::uuid, 1),
  ('77777777-7777-7777-7777-777777777722'::uuid, '66666666-6666-6666-6666-666666666603'::uuid,
   '44444444-4444-4444-4444-444444444422'::uuid, 2)
ON CONFLICT (id) DO NOTHING;

-- Create demo invoices
INSERT INTO app.invoices (id, tenant_id, customer_id, created_by_user_id, invoice_number, invoice_date, due_date, subtotal_minor, total_minor, status)
VALUES
  ('88888888-8888-8888-8888-888888888801'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '44444444-4444-4444-4444-444444444401'::uuid, '22222222-2222-2222-2222-222222222225'::uuid,
   'INV-2024-0001', '2024-01-10', '2024-01-25', 500000, 500000, 'sent'),
  ('88888888-8888-8888-8888-888888888802'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '44444444-4444-4444-4444-444444444401'::uuid, '22222222-2222-2222-2222-222222222225'::uuid,
   'INV-2024-0002', '2024-01-15', '2024-01-30', 750000, 750000, 'partial'),
  ('88888888-8888-8888-8888-888888888803'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '44444444-4444-4444-4444-444444444402'::uuid, '22222222-2222-2222-2222-222222222225'::uuid,
   'INV-2024-0003', '2024-01-18', '2024-02-02', 350000, 350000, 'sent')
ON CONFLICT (id) DO NOTHING;

-- Create invoice items
INSERT INTO app.invoice_items (id, invoice_id, product_id, description, quantity, unit_price_minor, line_total_minor)
VALUES
  ('99999999-9999-9999-9999-999999999901'::uuid, '88888888-8888-8888-8888-888888888801'::uuid,
   '55555555-5555-5555-5555-555555555501'::uuid, 'Minyak Goreng 1L', 10, 28000, 280000),
  ('99999999-9999-9999-9999-999999999902'::uuid, '88888888-8888-8888-8888-888888888801'::uuid,
   '55555555-5555-5555-5555-555555555503'::uuid, 'Gula Pasir 1kg', 12, 18000, 216000),
  ('99999999-9999-9999-9999-999999999903'::uuid, '88888888-8888-8888-8888-888888888802'::uuid,
   '55555555-5555-5555-5555-555555555502'::uuid, 'Beras Premium 5kg', 10, 75000, 750000),
  ('99999999-9999-9999-9999-999999999904'::uuid, '88888888-8888-8888-8888-888888888803'::uuid,
   '55555555-5555-5555-5555-555555555504'::uuid, 'Tepung Terigu 1kg', 15, 15000, 225000),
  ('99999999-9999-9999-9999-999999999905'::uuid, '88888888-8888-8888-8888-888888888803'::uuid,
   '55555555-5555-5555-5555-555555555505'::uuid, 'Kopi Sachet (isi 10)', 5, 25000, 125000)
ON CONFLICT (id) DO NOTHING;

-- Create demo payments
INSERT INTO app.payments (id, tenant_id, customer_id, collected_by_user_id, payment_number, payment_date, amount_minor, payment_method, status)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '44444444-4444-4444-4444-444444444401'::uuid, '22222222-2222-2222-2222-222222222227'::uuid,
   'PAY-2024-0001', '2024-01-20', 300000, 'cash', 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- Create payment allocations
INSERT INTO app.payment_allocations (id, payment_id, invoice_id, allocated_minor)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb001'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001'::uuid,
   '88888888-8888-8888-8888-888888888802'::uuid, 300000)
ON CONFLICT (id) DO NOTHING;

-- Create sample visit events
INSERT INTO app.visit_events (id, tenant_id, customer_id, user_id, event_type, occurred_at, latitude, longitude, accuracy_meters, is_within_geofence, notes, client_event_id)
VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccc001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '44444444-4444-4444-4444-444444444401'::uuid, '22222222-2222-2222-2222-222222222225'::uuid,
   'check_in', NOW() - INTERVAL '1 day', -6.2920, 106.7937, 12.5, true,
   'Customer was present, placed order', 'demo-event-001'),
  ('cccccccc-cccc-cccc-cccc-ccccccccc002'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '44444444-4444-4444-4444-444444444401'::uuid, '22222222-2222-2222-2222-222222222225'::uuid,
   'check_out', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes', -6.2920, 106.7938, 10.0, true,
   'Completed visit', 'demo-event-002'),
  ('cccccccc-cccc-cccc-cccc-ccccccccc003'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   '44444444-4444-4444-4444-444444444402'::uuid, '22222222-2222-2222-2222-222222222225'::uuid,
   'check_in', NOW() - INTERVAL '1 day' + INTERVAL '1 hour', -6.2555, 106.7890, 8.0, true,
   'Regular visit', 'demo-event-003')
ON CONFLICT (client_event_id) DO NOTHING;

COMMIT;

-- Summary
SELECT 'Seed data loaded successfully!' AS message;
SELECT 'Demo tenant: demo-distributor' AS info
UNION ALL
SELECT 'Demo users: owner@demo.com, admin@demo.com, supervisor@demo.com, sales1@demo.com, sales2@demo.com, collector@demo.com'
UNION ALL
SELECT 'Password for all users: password123';
