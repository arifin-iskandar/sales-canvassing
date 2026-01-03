# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

Sales Canvassing is a monorepo for an Indonesian field sales and collection tracking system. The system consists of a web dashboard, marketing site, and Android mobile app (via Capacitor), all designed for micro-distributors to manage field sales operations.

**Goal**: Help distributors increase cash collection speed and reduce "fake visits" using GPS-validated check-ins and photo proofs.

## Monorepo Structure

This is a pnpm workspace with apps and shared packages:

- `apps/web/`: TanStack Start app (authenticated dashboard + Capacitor mobile)
- `apps/marketing/`: Astro static site (marketing, pricing, demo request)
- `packages/sdk/`: Shared utilities (money utils via Decimal.js, geo calculations)
- `packages/db/`: Database utilities (Neon client, types)
- `packages/ui/`: Shared UI components (Radix + Tailwind)
- `infra/`: Database migrations (Neon Postgres)

## Development Commands

### Install dependencies
```bash
pnpm install
```

### Dev servers
```bash
pnpm dev:web        # TanStack Start app on :3000
pnpm dev:marketing  # Astro site on :4321
```

### Build & type-checking
```bash
pnpm -r lint                  # Type-check all packages
pnpm build:web                # Build web dashboard
pnpm build:marketing          # Build marketing site
```

### Testing
```bash
pnpm test                     # Run all tests
pnpm --filter web test:unit   # Unit tests only
```

### Database Migrations
```bash
# Apply migrations (requires DATABASE_URL)
cd infra
DATABASE_URL=postgres://... make migrate

# Rollback (drops schema)
DATABASE_URL=postgres://... make migrate-down

# Load demo seeds
DATABASE_URL=postgres://... make seed
```

### Deployment
```bash
# Deploy web dashboard
pnpm --filter web deploy

# Deploy marketing site
pnpm --filter marketing deploy
```

## Architecture & Tech Stack

### Frontend Stack
- **TanStack Start**: SSR-enabled React framework for authenticated app (`apps/web`)
  - TanStack Router for file-based routing (`src/routes/**`)
  - TanStack Query for data fetching
  - Radix UI + Tailwind for components
  - React Hook Form + Zod for form validation

- **Astro**: Static site for marketing (`apps/marketing`)
  - Cloudflare Pages deployment
  - React islands for interactive components

### Backend Stack
- **Cloudflare Workers**: Edge compute for all backends
- **Neon Postgres**: Primary database with RLS (Row-Level Security)
- **Cloudflare R2**: Photo storage for visit proofs

### Mobile Stack
- **Capacitor**: Android wrapper for web app
  - Native camera/geolocation plugins
  - SQLite for offline storage
  - Sync queue for offline-first operation

### Money Calculations
**CRITICAL**: All currency math must use `packages/sdk/src/money.ts` (Decimal.js wrapper). Never use raw JavaScript numbers or floats for money calculations.

## Key Concepts

### Users & Roles
| Role | Permissions |
|------|-------------|
| owner | Full access, billing |
| admin | All features, user management |
| supervisor | Route planning, monitoring, reports |
| sales | Field visits, create invoices |
| collector | Field visits, collect payments |

### Multi-Tenant Architecture
- All tables have `tenant_id` column
- RLS policies enforce tenant isolation via `app.current_tenant_id()`
- Composite FKs: `FOREIGN KEY (entity_id, tenant_id) REFERENCES parent(id, tenant_id)`
- URL structure: `/t/{tenantSlug}/...`

### Visit Events (Anti-Fraud)
- Append-only audit log (`app.visit_events`)
- Captures: timestamp, GPS, accuracy, geofence match, photo
- `client_event_id` for offline sync idempotency
- Supervisor exceptions view for anomalies

### Offline-First Mobile
- SQLite cache for routes/customers
- Sync queue with idempotent uploads
- Conflict resolution: server wins

## Database Schema

### Core Tables
```
app.tenants          # Companies/organizations
app.users            # User accounts
app.members          # User-tenant membership with role
app.mobile_tokens    # Mobile auth tokens
```

### Business Tables
```
app.branches         # Sales territories
app.customers        # Customer master (with GPS)
app.routes           # PJP schedules
app.route_stops      # Ordered stops in a route
app.visit_events     # Field activity log
app.products         # Product catalog (optional)
app.invoices         # Customer invoices
app.invoice_items    # Invoice line items
app.payments         # Payment records
app.payment_allocations  # Payment-to-invoice mapping
app.promise_to_pay   # PTP records
```

### Money Conventions
- All monetary values stored as `BIGINT` in **minor units** (cents)
- Column suffix: `_minor` (e.g., `total_minor`, `balance_minor`)
- IDR uses scale 0 (no decimal places)
- Always use `Money` class from `packages/sdk` for calculations

## API Endpoints

### Auth
- `POST /api/auth/login` - Web login (sets cookie)
- `POST /api/auth/signup` - Create tenant + user
- `POST /api/auth/logout` - Clear session
- `POST /api/auth/mobile-login` - Mobile login (returns token)

### Tenant-Scoped (all require auth)
- `GET/POST /api/t/:tenant/customers` - Customer CRUD
- `GET/POST /api/t/:tenant/routes` - Route management
- `GET /api/t/:tenant/routes/today` - Today's route for user
- `POST /api/t/:tenant/visits/check-in` - Record visit
- `GET/POST /api/t/:tenant/invoices` - Invoice management
- `GET/POST /api/t/:tenant/payments` - Payment recording
- `POST /api/t/:tenant/sync` - Mobile offline sync
- `GET /api/t/:tenant/reports/aging` - Aging report
- `POST /api/t/:tenant/media/upload` - Get signed upload URL

## Coding Conventions

### TypeScript
- Strict mode enabled
- Prefer descriptive camelCase variables
- PascalCase for React components

### File Naming
- Routes: File-based routing in `src/routes/`
- React components: PascalCase files
- Utilities: camelCase files

### Styling
- TailwindCSS for all styling
- Shared UI components in `packages/ui`
- CSS variables for theming (see `app.css`)

### React Patterns
- **CRITICAL**: All hooks at top level, before conditional returns
- Use React Query for server state
- Use React Hook Form for forms

## Testing Strategy

### Unit Tests
- Geofence calculations (`isWithinGeofence`)
- Money calculations
- Aging bucket logic

### Integration Tests
- Sync API idempotency
- Auth flow (web + mobile)
- RLS isolation

## Common Pitfalls

### Money Math
Always use `packages/sdk/src/money.ts` for currency calculations. Never use `Number`, `parseFloat`, or arithmetic operators directly on money values.

### Radix Select "None" Values
When offering a "None/Not set" option in a Radix Select, use an explicit sentinel string (e.g., `"__none__"`) and map it to `null` in `onValueChange`.

### Offline Sync
- Always generate `client_event_id` (UUID) on mobile
- Server uses unique index for idempotency
- Never update visit_events after sync (append-only)

### RLS and Tenant Access
- Always pass `tenant_id` in queries
- Use composite FKs for cross-table references
- Test tenant isolation in integration tests

## Environment Variables

### Required
```bash
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
SESSION_SECRET=minimum-16-characters
```

### Optional
```bash
NEON_DATABASE_URL=...  # Fallback for DATABASE_URL
APP_ENV=development|staging|production
PUBLIC_MARKETING_URL=https://...
```

## Git Workflow

### Commit Messages
Follow conventional commits: `type(scope): summary`
- Types: `feat`, `fix`, `chore`, `test`, `docs`, `refactor`
- Keep summaries ≤72 chars, imperative tone

### Branches
- `main` - Production-ready code
- `feat/*` - Feature branches
- `fix/*` - Bug fix branches
