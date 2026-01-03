/**
 * Test fixtures for Sales Canvassing + Collection Tracker
 * Use these for unit and integration tests
 */

import type { SessionSummary } from '../server/env'

// Demo tenant ID
export const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'
export const DEMO_TENANT_SLUG = 'demo-distributor'
export const DEMO_TENANT_NAME = 'PT Demo Distributor'

// User IDs
export const USER_IDS = {
  owner: '22222222-2222-2222-2222-222222222222',
  admin: '22222222-2222-2222-2222-222222222223',
  supervisor: '22222222-2222-2222-2222-222222222224',
  sales1: '22222222-2222-2222-2222-222222222225',
  sales2: '22222222-2222-2222-2222-222222222226',
  collector: '22222222-2222-2222-2222-222222222227',
} as const

// Branch IDs
export const BRANCH_IDS = {
  jakartaSelatan: '33333333-3333-3333-3333-333333333331',
  jakartaTimur: '33333333-3333-3333-3333-333333333332',
  jakartaBarat: '33333333-3333-3333-3333-333333333333',
} as const

// Customer IDs
export const CUSTOMER_IDS = {
  tokoMajuJaya: '44444444-4444-4444-4444-444444444401',
  warungBerkah: '44444444-4444-4444-4444-444444444402',
  minimarketSinar: '44444444-4444-4444-4444-444444444403',
  tokoSembakoMakmur: '44444444-4444-4444-4444-444444444404',
  tokoAbadi: '44444444-4444-4444-4444-444444444411',
  warungSederhana: '44444444-4444-4444-4444-444444444412',
  kiosBahagia: '44444444-4444-4444-4444-444444444413',
  tokoRejeki: '44444444-4444-4444-4444-444444444421',
  warungSegar: '44444444-4444-4444-4444-444444444422',
} as const

// Product IDs
export const PRODUCT_IDS = {
  minyakGoreng: '55555555-5555-5555-5555-555555555501',
  berasPremium: '55555555-5555-5555-5555-555555555502',
  gulaPasir: '55555555-5555-5555-5555-555555555503',
  tepungTerigu: '55555555-5555-5555-5555-555555555504',
  kopiSachet: '55555555-5555-5555-5555-555555555505',
} as const

// Sample session fixtures
export const sessions: Record<string, SessionSummary> = {
  owner: {
    sub: USER_IDS.owner,
    tenant: DEMO_TENANT_ID,
    email: 'owner@demo.com',
    role: 'owner',
    name: 'Budi Santoso',
    slug: DEMO_TENANT_SLUG,
  },
  admin: {
    sub: USER_IDS.admin,
    tenant: DEMO_TENANT_ID,
    email: 'admin@demo.com',
    role: 'admin',
    name: 'Siti Rahayu',
    slug: DEMO_TENANT_SLUG,
  },
  supervisor: {
    sub: USER_IDS.supervisor,
    tenant: DEMO_TENANT_ID,
    email: 'supervisor@demo.com',
    role: 'supervisor',
    name: 'Agus Wijaya',
    slug: DEMO_TENANT_SLUG,
  },
  sales1: {
    sub: USER_IDS.sales1,
    tenant: DEMO_TENANT_ID,
    email: 'sales1@demo.com',
    role: 'sales',
    name: 'Dewi Lestari',
    slug: DEMO_TENANT_SLUG,
  },
  sales2: {
    sub: USER_IDS.sales2,
    tenant: DEMO_TENANT_ID,
    email: 'sales2@demo.com',
    role: 'sales',
    name: 'Rizki Pratama',
    slug: DEMO_TENANT_SLUG,
  },
  collector: {
    sub: USER_IDS.collector,
    tenant: DEMO_TENANT_ID,
    email: 'collector@demo.com',
    role: 'collector',
    name: 'Eka Putra',
    slug: DEMO_TENANT_SLUG,
  },
}

// Sample customer data
export const customers = {
  tokoMajuJaya: {
    id: CUSTOMER_IDS.tokoMajuJaya,
    tenantId: DEMO_TENANT_ID,
    branchId: BRANCH_IDS.jakartaSelatan,
    code: 'CUST-001',
    name: 'Toko Maju Jaya',
    address: 'Jl. Raya Fatmawati No. 123',
    phone: '+6281234567801',
    latitude: -6.2920,
    longitude: 106.7937,
    geofenceMeters: 50,
    currentBalanceMinor: 0,
  },
  warungBerkah: {
    id: CUSTOMER_IDS.warungBerkah,
    tenantId: DEMO_TENANT_ID,
    branchId: BRANCH_IDS.jakartaSelatan,
    code: 'CUST-002',
    name: 'Warung Berkah',
    address: 'Jl. Radio Dalam No. 45',
    phone: '+6281234567802',
    latitude: -6.2555,
    longitude: 106.7890,
    geofenceMeters: 50,
    currentBalanceMinor: 0,
  },
}

// Sample product data
export const products = {
  minyakGoreng: {
    id: PRODUCT_IDS.minyakGoreng,
    tenantId: DEMO_TENANT_ID,
    sku: 'PRD-001',
    name: 'Minyak Goreng 1L',
    unit: 'botol',
    priceMinor: 28000,
  },
  berasPremium: {
    id: PRODUCT_IDS.berasPremium,
    tenantId: DEMO_TENANT_ID,
    sku: 'PRD-002',
    name: 'Beras Premium 5kg',
    unit: 'karung',
    priceMinor: 75000,
  },
  gulaPasir: {
    id: PRODUCT_IDS.gulaPasir,
    tenantId: DEMO_TENANT_ID,
    sku: 'PRD-003',
    name: 'Gula Pasir 1kg',
    unit: 'pack',
    priceMinor: 18000,
  },
}

// Sample branch data
export const branches = {
  jakartaSelatan: {
    id: BRANCH_IDS.jakartaSelatan,
    tenantId: DEMO_TENANT_ID,
    code: 'JKT-SEL',
    name: 'Jakarta Selatan',
    address: 'Jl. TB Simatupang No. 1',
    phone: '+6221111111',
  },
  jakartaTimur: {
    id: BRANCH_IDS.jakartaTimur,
    tenantId: DEMO_TENANT_ID,
    code: 'JKT-TIM',
    name: 'Jakarta Timur',
    address: 'Jl. Pemuda No. 25',
    phone: '+6221222222',
  },
  jakartaBarat: {
    id: BRANCH_IDS.jakartaBarat,
    tenantId: DEMO_TENANT_ID,
    code: 'JKT-BAR',
    name: 'Jakarta Barat',
    address: 'Jl. Kebon Jeruk No. 10',
    phone: '+6221333333',
  },
}

// Jakarta locations for testing geofence
export const jakartaLocations = {
  monas: { latitude: -6.1754, longitude: 106.8272 },
  kotaTua: { latitude: -6.1352, longitude: 106.8133 },
  fatmawati: { latitude: -6.2920, longitude: 106.7937 },
  kemang: { latitude: -6.2631, longitude: 106.8111 },
  senayan: { latitude: -6.2258, longitude: 106.8029 },
}

// Helper to create mock visit event
export function createMockVisitEvent(overrides: Partial<{
  id: string
  customerId: string
  userId: string
  eventType: string
  latitude: number
  longitude: number
  accuracyMeters: number
  isWithinGeofence: boolean
  notes: string
  clientEventId: string
}> = {}) {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    tenantId: DEMO_TENANT_ID,
    customerId: overrides.customerId ?? CUSTOMER_IDS.tokoMajuJaya,
    userId: overrides.userId ?? USER_IDS.sales1,
    eventType: overrides.eventType ?? 'check_in',
    occurredAt: new Date().toISOString(),
    latitude: overrides.latitude ?? jakartaLocations.fatmawati.latitude,
    longitude: overrides.longitude ?? jakartaLocations.fatmawati.longitude,
    accuracyMeters: overrides.accuracyMeters ?? 10,
    isWithinGeofence: overrides.isWithinGeofence ?? true,
    photoUrl: null,
    notes: overrides.notes ?? null,
    clientEventId: overrides.clientEventId ?? `client-${crypto.randomUUID()}`,
  }
}

// Helper to create mock invoice
export function createMockInvoice(overrides: Partial<{
  id: string
  customerId: string
  invoiceNumber: string
  totalMinor: number
  paidMinor: number
  status: string
}> = {}) {
  const totalMinor = overrides.totalMinor ?? 500000
  const paidMinor = overrides.paidMinor ?? 0

  return {
    id: overrides.id ?? crypto.randomUUID(),
    tenantId: DEMO_TENANT_ID,
    customerId: overrides.customerId ?? CUSTOMER_IDS.tokoMajuJaya,
    createdByUserId: USER_IDS.sales1,
    invoiceNumber: overrides.invoiceNumber ?? `INV-${Date.now()}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotalMinor: totalMinor,
    taxMinor: 0,
    totalMinor,
    paidMinor,
    balanceMinor: totalMinor - paidMinor,
    status: overrides.status ?? (paidMinor === 0 ? 'sent' : paidMinor >= totalMinor ? 'paid' : 'partial'),
  }
}

// Helper to create mock payment
export function createMockPayment(overrides: Partial<{
  id: string
  customerId: string
  amountMinor: number
  paymentMethod: string
  status: string
}> = {}) {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    tenantId: DEMO_TENANT_ID,
    customerId: overrides.customerId ?? CUSTOMER_IDS.tokoMajuJaya,
    collectedByUserId: USER_IDS.collector,
    paymentNumber: `PAY-${Date.now()}`,
    paymentDate: new Date().toISOString().split('T')[0],
    amountMinor: overrides.amountMinor ?? 100000,
    paymentMethod: overrides.paymentMethod ?? 'cash',
    referenceNumber: null,
    photoUrl: null,
    latitude: jakartaLocations.fatmawati.latitude,
    longitude: jakartaLocations.fatmawati.longitude,
    notes: null,
    status: overrides.status ?? 'pending',
  }
}
