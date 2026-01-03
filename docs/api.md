# API Documentation

This document describes the REST API endpoints for the Sales Canvassing + Collection Tracker.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Staging**: `https://sales-canvassing-staging.example.workers.dev/api`
- **Production**: `https://sales-canvassing.example.workers.dev/api`

## Authentication

The API supports two authentication methods:

### Web Authentication (Cookie-based)

Web clients authenticate using session cookies. Login returns a `Set-Cookie` header with the session token.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Mobile Authentication (Bearer Token)

Mobile clients authenticate using bearer tokens. The `/api/auth/mobile-login` endpoint returns a JWT token.

```http
POST /api/auth/mobile-login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Response includes token:
{
  "ok": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

# Use in subsequent requests:
GET /api/t/my-company/customers
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Common Response Format

All API responses follow this format:

### Success Response

```json
{
  "ok": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "ok": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied to this resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `CONFLICT` | 409 | Resource already exists |

---

## Authentication Endpoints

### POST /api/auth/login

Authenticate user and create session.

**Request Body:**

```json
{
  "email": "user@example.com",   // Optional if phone provided
  "phone": "+6281234567890",     // Optional if email provided
  "password": "password123"       // Required, min 6 characters
}
```

**Success Response (200):**

```json
{
  "ok": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "phone": null,
    "fullName": "John Doe",
    "role": "owner"
  },
  "tenant": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "slug": "pt-jaya-makmur",
    "name": "PT Jaya Makmur"
  }
}
```

**Headers:** `Set-Cookie: canvassing_session=...; HttpOnly; Secure; SameSite=Lax`

**Error Responses:**
- `400`: Invalid input (email/phone required, password too short)
- `401`: Invalid credentials
- `503`: Database not configured

---

### POST /api/auth/signup

Create new tenant and user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "phone": "+6281234567890",     // Optional if email provided
  "password": "password123",
  "fullName": "John Doe",
  "tenantName": "PT Jaya Makmur"
}
```

**Success Response (200):**

```json
{
  "ok": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "phone": null,
    "fullName": "John Doe",
    "role": "owner"
  },
  "tenant": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "slug": "pt-jaya-makmur",
    "name": "PT Jaya Makmur"
  }
}
```

**Error Responses:**
- `400`: Invalid input
- `409`: Email, phone, or tenant name already exists
- `503`: Database not configured

---

### POST /api/auth/logout

Clear session and logout.

**Success Response (200):**

```json
{
  "ok": true
}
```

**Headers:** `Set-Cookie: canvassing_session=; Max-Age=0`

---

### GET /api/auth/me

Get current authenticated user info.

**Requires:** Authentication

**Success Response (200):**

```json
{
  "ok": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "phone": null,
    "name": "John Doe",
    "role": "owner"
  },
  "tenant": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "slug": "pt-jaya-makmur"
  }
}
```

**Error Responses:**
- `401`: Not authenticated

---

### POST /api/auth/mobile-login

Authenticate and get bearer token for mobile clients.

**Request Body:** Same as `/api/auth/login`

**Success Response (200):**

```json
{
  "ok": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "sales"
  },
  "tenant": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "slug": "pt-jaya-makmur",
    "name": "PT Jaya Makmur"
  }
}
```

Token is valid for 30 days.

---

## Tenant-Scoped Endpoints

All tenant-scoped endpoints require authentication and follow this pattern:

```
/api/t/{tenant-slug}/{resource}
```

The authenticated user must have access to the specified tenant.

---

## Customer Endpoints

### GET /api/t/:tenant/customers

List customers with optional filters.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `search` | string | Search by name, code, phone, address |
| `branchId` | uuid | Filter by branch |
| `hasGps` | boolean | Filter customers with/without GPS |
| `sortBy` | string | Sort field (name, code, createdAt) |
| `sortOrder` | string | Sort direction (asc, desc) |

**Success Response (200):**

```json
{
  "ok": true,
  "data": {
    "customers": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "code": "CUST-001",
        "name": "Toko Maju Jaya",
        "address": "Jl. Raya No. 123",
        "phone": "+6281234567890",
        "latitude": -6.2088,
        "longitude": 106.8456,
        "geofenceMeters": 50,
        "currentBalanceMinor": 1500000,
        "createdAt": "2024-01-15T08:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

### POST /api/t/:tenant/customers

Create a new customer.

**Request Body:**

```json
{
  "code": "CUST-002",
  "name": "Toko Berkah",
  "address": "Jl. Sudirman No. 45",
  "phone": "+6281234567891",
  "email": "tokoberkah@email.com",
  "branchId": "550e8400-e29b-41d4-a716-446655440020",
  "latitude": -6.2100,
  "longitude": 106.8470,
  "geofenceMeters": 50,
  "notes": "Open 8am-8pm daily"
}
```

**Success Response (201):**

```json
{
  "ok": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440011",
    "code": "CUST-002",
    "name": "Toko Berkah",
    ...
  }
}
```

---

### GET /api/t/:tenant/customers/:id

Get customer details.

**Success Response (200):**

```json
{
  "ok": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "code": "CUST-001",
    "name": "Toko Maju Jaya",
    "address": "Jl. Raya No. 123",
    "phone": "+6281234567890",
    "email": "tokumaju@email.com",
    "branchId": "550e8400-e29b-41d4-a716-446655440020",
    "branch": {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "name": "Jakarta Selatan"
    },
    "latitude": -6.2088,
    "longitude": 106.8456,
    "geofenceMeters": 50,
    "currentBalanceMinor": 1500000,
    "notes": "Preferred customer",
    "createdAt": "2024-01-15T08:30:00Z",
    "updatedAt": "2024-01-20T10:15:00Z"
  }
}
```

---

## Visit Endpoints

### POST /api/t/:tenant/visits/check-in

Record a visit check-in event.

**Request Body:**

```json
{
  "customerId": "550e8400-e29b-41d4-a716-446655440010",
  "eventType": "check_in",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "accuracyMeters": 15.5,
  "photoUrl": "https://storage.example.com/photos/visit-123.jpg",
  "notes": "Customer was busy, will return later",
  "clientEventId": "client-uuid-for-offline-sync"
}
```

**Success Response (201):**

```json
{
  "ok": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440030",
    "customerId": "550e8400-e29b-41d4-a716-446655440010",
    "eventType": "check_in",
    "occurredAt": "2024-01-15T09:30:00Z",
    "isWithinGeofence": true,
    "distanceMeters": 12.5,
    "accuracyMeters": 15.5
  }
}
```

**Notes:**
- `clientEventId` is used for offline sync idempotency
- `isWithinGeofence` is calculated based on customer's geofence settings
- Supports event types: `check_in`, `check_out`, `photo`, `payment`, `invoice`, `ptp`

---

### GET /api/t/:tenant/routes/today

Get today's assigned route for the authenticated user.

**Success Response (200):**

```json
{
  "ok": true,
  "data": {
    "route": {
      "id": "550e8400-e29b-41d4-a716-446655440040",
      "name": "Rute Senin - Jakarta Selatan",
      "assignedUserId": "550e8400-e29b-41d4-a716-446655440000"
    },
    "stops": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440041",
        "sequence": 1,
        "customer": {
          "id": "550e8400-e29b-41d4-a716-446655440010",
          "code": "CUST-001",
          "name": "Toko Maju Jaya",
          "address": "Jl. Raya No. 123",
          "latitude": -6.2088,
          "longitude": 106.8456
        },
        "visitStatus": "not_visited"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440042",
        "sequence": 2,
        "customer": {
          "id": "550e8400-e29b-41d4-a716-446655440011",
          "code": "CUST-002",
          "name": "Toko Berkah",
          "address": "Jl. Sudirman No. 45",
          "latitude": -6.2100,
          "longitude": 106.8470
        },
        "visitStatus": "visited",
        "lastVisitAt": "2024-01-15T08:30:00Z"
      }
    ]
  }
}
```

---

## Invoice Endpoints

### GET /api/t/:tenant/invoices

List invoices with filters.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (draft, sent, partial, paid, overdue, cancelled) |
| `customerId` | uuid | Filter by customer |
| `fromDate` | date | Filter by invoice date (from) |
| `toDate` | date | Filter by invoice date (to) |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Success Response (200):**

```json
{
  "ok": true,
  "data": {
    "invoices": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440050",
        "invoiceNumber": "INV-2024-0001",
        "customerId": "550e8400-e29b-41d4-a716-446655440010",
        "customer": {
          "name": "Toko Maju Jaya"
        },
        "invoiceDate": "2024-01-15",
        "dueDate": "2024-01-30",
        "totalMinor": 1500000,
        "paidMinor": 500000,
        "balanceMinor": 1000000,
        "status": "partial"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### POST /api/t/:tenant/invoices

Create a new invoice.

**Request Body:**

```json
{
  "customerId": "550e8400-e29b-41d4-a716-446655440010",
  "invoiceDate": "2024-01-15",
  "dueDate": "2024-01-30",
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440060",
      "description": "Product A",
      "quantity": 10,
      "unitPriceMinor": 50000
    },
    {
      "description": "Delivery fee",
      "quantity": 1,
      "unitPriceMinor": 25000
    }
  ],
  "taxMinor": 0,
  "notes": "Payment due in 15 days",
  "photoUrl": "https://storage.example.com/invoices/photo-123.jpg"
}
```

**Success Response (201):**

```json
{
  "ok": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440050",
    "invoiceNumber": "INV-2024-0001",
    "subtotalMinor": 525000,
    "taxMinor": 0,
    "totalMinor": 525000,
    "status": "draft"
  }
}
```

---

## Payment Endpoints

### POST /api/t/:tenant/payments

Record a payment.

**Request Body:**

```json
{
  "customerId": "550e8400-e29b-41d4-a716-446655440010",
  "amountMinor": 500000,
  "paymentMethod": "cash",
  "paymentDate": "2024-01-20",
  "referenceNumber": "TRF-12345",
  "photoUrl": "https://storage.example.com/payments/receipt-123.jpg",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "notes": "Partial payment for INV-2024-0001",
  "allocations": [
    {
      "invoiceId": "550e8400-e29b-41d4-a716-446655440050",
      "allocatedMinor": 500000
    }
  ]
}
```

**Payment Methods:** `cash`, `transfer`, `check`, `giro`, `qris`

**Success Response (201):**

```json
{
  "ok": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440070",
    "paymentNumber": "PAY-2024-0001",
    "amountMinor": 500000,
    "status": "pending"
  }
}
```

---

## Report Endpoints

### GET /api/t/:tenant/reports/aging

Get aging report for customer balances.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `branchId` | uuid | Filter by branch |
| `asOfDate` | date | Calculate aging as of this date |

**Success Response (200):**

```json
{
  "ok": true,
  "data": {
    "asOfDate": "2024-01-20",
    "summary": {
      "current": 5000000,
      "days1to30": 2500000,
      "days31to60": 1000000,
      "days61to90": 500000,
      "over90": 250000,
      "total": 9250000
    },
    "customers": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "code": "CUST-001",
        "name": "Toko Maju Jaya",
        "current": 1000000,
        "days1to30": 500000,
        "days31to60": 0,
        "days61to90": 0,
        "over90": 0,
        "total": 1500000
      }
    ]
  }
}
```

---

## Sync Endpoint (Mobile)

### POST /api/sync

Sync offline events from mobile client.

**Request Body:**

```json
{
  "events": [
    {
      "clientEventId": "client-uuid-1",
      "eventType": "check_in",
      "customerId": "550e8400-e29b-41d4-a716-446655440010",
      "occurredAt": "2024-01-15T09:30:00Z",
      "latitude": -6.2088,
      "longitude": 106.8456,
      "accuracyMeters": 15.5
    },
    {
      "clientEventId": "client-uuid-2",
      "eventType": "payment",
      "customerId": "550e8400-e29b-41d4-a716-446655440010",
      "occurredAt": "2024-01-15T09:35:00Z",
      "amountMinor": 500000,
      "paymentMethod": "cash"
    }
  ]
}
```

**Success Response (200):**

```json
{
  "ok": true,
  "data": {
    "synced": 2,
    "results": [
      { "clientEventId": "client-uuid-1", "status": "created", "serverId": "..." },
      { "clientEventId": "client-uuid-2", "status": "created", "serverId": "..." }
    ]
  }
}
```

**Note:** Events with duplicate `clientEventId` will be skipped (idempotent).

---

## Media Endpoints

### POST /api/t/:tenant/media/upload

Get a signed URL for uploading files to storage.

**Request Body:**

```json
{
  "contentType": "image/jpeg",
  "filename": "visit-photo.jpg",
  "purpose": "visit"  // "visit", "invoice", "payment"
}
```

**Success Response (200):**

```json
{
  "ok": true,
  "data": {
    "uploadUrl": "https://storage.example.com/upload?signature=...",
    "publicUrl": "https://storage.example.com/photos/abc123.jpg",
    "expiresAt": "2024-01-15T10:00:00Z"
  }
}
```

---

## Rate Limiting

API requests are rate limited to:
- **Authenticated**: 1000 requests per minute
- **Unauthenticated**: 100 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705312800
```

---

## Webhooks (Future)

Webhook support for real-time integrations will be added in a future release. Planned events:
- `visit.created`
- `invoice.created`
- `payment.created`
- `payment.confirmed`
