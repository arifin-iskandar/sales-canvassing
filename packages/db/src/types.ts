/**
 * Shared database types for Sales Canvassing
 */

// User roles
export type UserRole = 'owner' | 'admin' | 'supervisor' | 'sales' | 'collector'

// Visit event types
export type VisitEventType =
  | 'check_in'
  | 'check_out'
  | 'photo_captured'
  | 'order_created'
  | 'payment_collected'
  | 'ptp_recorded'
  | 'note_added'

// Invoice status
export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled'

// Payment method
export type PaymentMethod = 'cash' | 'transfer' | 'check' | 'giro'

// Payment status
export type PaymentStatus = 'pending' | 'confirmed' | 'rejected' | 'deposited'

// PTP status
export type PtpStatus = 'pending' | 'fulfilled' | 'broken' | 'cancelled'

// Route status
export type RouteStatus = 'active' | 'inactive'

// Sync status for offline events
export type SyncStatus = 'pending' | 'synced' | 'conflict'

// Base entity with tenant scope
export type TenantScoped = {
  id: string
  tenantId: string
}

// Timestamps
export type Timestamps = {
  createdAt: string
  updatedAt: string
}

// Soft delete
export type SoftDelete = {
  deletedAt: string | null
}

// Tenant
export type Tenant = TenantScoped & Timestamps & {
  slug: string
  name: string
  planId: string
  settings: Record<string, unknown>
}

// User
export type User = {
  id: string
  email: string | null
  phone: string | null
  fullName: string
  createdAt: string
  updatedAt: string
}

// Member (user + tenant)
export type Member = {
  tenantId: string
  userId: string
  role: UserRole
  status: 'active' | 'inactive'
  createdAt: string
}

// Branch
export type Branch = TenantScoped & Timestamps & SoftDelete & {
  code: string
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  geofenceMeters: number
}

// Customer
export type Customer = TenantScoped & Timestamps & SoftDelete & {
  branchId: string | null
  customerCode: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  latitude: number | null
  longitude: number | null
  geofenceMeters: number
  paymentTermsDays: number
  creditLimitMinor: number
  currentBalanceMinor: number
  metadata: Record<string, unknown>
}

// Route
export type Route = TenantScoped & Timestamps & {
  name: string
  assignedUserId: string | null
  effectiveDate: string
  dayOfWeek: number | null
  isRecurring: boolean
  status: RouteStatus
}

// Route Stop
export type RouteStop = TenantScoped & {
  routeId: string
  customerId: string
  sequenceOrder: number
  notes: string | null
}

// Visit Event
export type VisitEvent = TenantScoped & {
  customerId: string
  userId: string
  routeId: string | null
  eventType: VisitEventType
  occurredAt: string
  latitude: number | null
  longitude: number | null
  accuracyMeters: number | null
  isWithinGeofence: boolean | null
  distanceFromCustomerMeters: number | null
  photoUrl: string | null
  notes: string | null
  metadata: Record<string, unknown>
  deviceId: string | null
  syncStatus: SyncStatus
  clientEventId: string | null
  createdAt: string
}

// Product
export type Product = TenantScoped & Timestamps & {
  sku: string
  name: string
  unit: string
  priceMinor: number
  isActive: boolean
}

// Invoice
export type Invoice = TenantScoped & Timestamps & {
  customerId: string
  createdByUserId: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string | null
  subtotalMinor: number
  taxMinor: number
  totalMinor: number
  paidMinor: number
  balanceMinor: number
  status: InvoiceStatus
  notes: string | null
  metadata: Record<string, unknown>
}

// Invoice Item
export type InvoiceItem = {
  id: string
  invoiceId: string
  productId: string | null
  description: string
  quantity: number
  unitPriceMinor: number
  lineTotalMinor: number
  metadata: Record<string, unknown>
}

// Payment
export type Payment = TenantScoped & Timestamps & {
  customerId: string
  collectedByUserId: string
  paymentNumber: string
  paymentDate: string
  amountMinor: number
  paymentMethod: PaymentMethod
  referenceNumber: string | null
  photoUrl: string | null
  latitude: number | null
  longitude: number | null
  notes: string | null
  status: PaymentStatus
}

// Payment Allocation
export type PaymentAllocation = {
  id: string
  paymentId: string
  invoiceId: string
  allocatedMinor: number
  createdAt: string
}

// Promise to Pay
export type PromiseToPay = TenantScoped & Timestamps & {
  customerId: string
  invoiceId: string | null
  recordedByUserId: string
  promisedDate: string
  promisedAmountMinor: number
  status: PtpStatus
  notes: string | null
}

// Session summary (for JWT claims)
export type SessionSummary = {
  sub: string
  tenant: string
  email?: string
  phone?: string
  role: UserRole
  name?: string
  slug?: string
}

// Aging bucket for reports
export type AgingBucket = {
  current: number
  days1To30: number
  days31To60: number
  days61To90: number
  days90Plus: number
  total: number
}
