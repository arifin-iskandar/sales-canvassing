# Sales Canvassing + Collection Tracker

A field sales and collection tracking system for Indonesian micro-distributors. This application helps distributors manage field sales operations, track customer visits, process invoices and payments, and reduce "fake visits" using GPS-validated check-ins and photo proofs.

## Features

- **Customer Management**: Track customers with GPS coordinates and geofence settings
- **Route Planning (PJP)**: Create and assign recurring sales routes
- **GPS-Validated Check-in**: Capture GPS + photo + timestamp + notes for each visit
- **Invoice Management**: Create, track, and export invoices
- **Payment Collection**: Record payments with photo proof and GPS location
- **Aging Reports**: Track overdue balances by aging bucket
- **Anti-Fraud Detection**: Flag visits outside geofence, low accuracy, and rapid check-ins
- **Offline-First Mobile**: Works without signal, syncs when connected

## Tech Stack

- **Frontend**: TanStack Start, TanStack Router, TanStack Query, React 19
- **UI**: Radix UI + Tailwind CSS
- **Backend**: Cloudflare Workers (Edge compute)
- **Database**: Neon Postgres with Row-Level Security (RLS)
- **Mobile**: Capacitor for Android wrapper
- **Marketing**: Astro static site

## Project Structure

```
sales-canvassing/
├── apps/
│   ├── web/                    # TanStack Start dashboard + Capacitor mobile
│   └── marketing/              # Astro marketing site
├── packages/
│   ├── sdk/                    # Shared utilities (money, geo, sync)
│   ├── db/                     # Neon client, types
│   └── ui/                     # Shared UI components
└── infra/
    ├── migrations/neon/        # Postgres migrations
    └── seeds/                  # Demo data
```

## Prerequisites

- Node.js >= 20
- pnpm >= 8.15
- Neon Postgres account (for database)
- Cloudflare account (for deployment)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/arifin-iskandar/sales-canvassing.git
cd sales-canvassing
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create `.env` files as needed:

```bash
# apps/web/.env
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
SESSION_SECRET=your-minimum-16-character-secret
APP_ENV=development
```

### 4. Run database migrations

```bash
# Apply all migrations
cd infra
DATABASE_URL=postgresql://... psql -f migrations/neon/001_core.sql
DATABASE_URL=postgresql://... psql -f migrations/neon/002_branches_customers.sql
DATABASE_URL=postgresql://... psql -f migrations/neon/003_routes_visits.sql
DATABASE_URL=postgresql://... psql -f migrations/neon/004_invoices_payments.sql

# Or use the Makefile
DATABASE_URL=postgresql://... make migrate
```

### 5. Start development servers

```bash
# Web dashboard (port 3000)
pnpm dev:web

# Marketing site (port 4321)
pnpm dev:marketing
```

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm dev:web` | Start web dashboard dev server |
| `pnpm dev:marketing` | Start marketing site dev server |
| `pnpm build:web` | Build web dashboard |
| `pnpm build:marketing` | Build marketing site |
| `pnpm test` | Run all tests |
| `pnpm -r lint` | Type-check all packages |

### Package-specific commands

```bash
# SDK package
pnpm --filter @canvassing/sdk test        # Run SDK tests
pnpm --filter @canvassing/sdk test:watch  # Watch mode

# Web app
pnpm --filter web test                    # Run web tests
pnpm --filter web build                   # Build for production
pnpm --filter web deploy                  # Deploy to Cloudflare
```

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `app.tenants` | Organizations/companies |
| `app.users` | User accounts |
| `app.members` | User-tenant membership with roles |
| `app.mobile_tokens` | Mobile authentication tokens |
| `app.sessions` | Web sessions |

### Business Tables

| Table | Description |
|-------|-------------|
| `app.branches` | Sales territories |
| `app.customers` | Customer master with GPS coordinates |
| `app.routes` | PJP (route) schedules |
| `app.route_stops` | Ordered stops in a route |
| `app.visit_events` | Field activity audit log (append-only) |
| `app.products` | Product catalog |
| `app.invoices` | Customer invoices |
| `app.invoice_items` | Invoice line items |
| `app.payments` | Payment records |
| `app.payment_allocations` | Payment-to-invoice mapping |
| `app.promise_to_pay` | PTP records |

### Money Conventions

- All monetary values stored as `BIGINT` in **minor units** (IDR has no decimal places)
- Column suffix: `_minor` (e.g., `total_minor`, `balance_minor`)
- Use `Money` class from `@canvassing/sdk` for calculations

## User Roles

| Role | Permissions |
|------|-------------|
| `owner` | Full access, billing, user management |
| `admin` | All features, user management |
| `supervisor` | Route planning, monitoring, reports |
| `sales` | Field visits, create invoices |
| `collector` | Field visits, collect payments |

## API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Web login (sets cookie) |
| `/api/auth/signup` | POST | Create tenant + user |
| `/api/auth/logout` | POST | Clear session |
| `/api/auth/me` | GET | Get current user info |
| `/api/auth/mobile-login` | POST | Mobile login (returns token) |

### Tenant-Scoped (require authentication)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/t/:tenant/customers` | GET, POST | Customer CRUD |
| `/api/t/:tenant/routes` | GET, POST | Route management |
| `/api/t/:tenant/routes/today` | GET | Today's route for user |
| `/api/t/:tenant/visits/check-in` | POST | Record visit |
| `/api/t/:tenant/invoices` | GET, POST | Invoice management |
| `/api/t/:tenant/payments` | GET, POST | Payment recording |
| `/api/t/:tenant/sync` | POST | Mobile offline sync |
| `/api/t/:tenant/reports/aging` | GET | Aging report |
| `/api/t/:tenant/media/upload` | POST | Get signed upload URL |

## Testing

### Run all tests

```bash
pnpm test
```

### Run specific test suites

```bash
# SDK tests (money, geo utilities)
pnpm --filter @canvassing/sdk test

# Web server tests (auth, session, API)
pnpm --filter web test

# Watch mode
pnpm --filter @canvassing/sdk test:watch
```

### Test Coverage

The test suite covers:

- **SDK**: Money calculations (Decimal.js wrapper), geolocation utilities (Haversine formula)
- **Server**: JWT session management, password hashing (PBKDF2), auth handlers
- **API**: Request routing, tenant scope enforcement, role-based access

## Deployment

### Deploy to Cloudflare Workers

```bash
# Build and deploy web dashboard
pnpm --filter web build
pnpm --filter web deploy

# Build and deploy marketing site
pnpm --filter marketing build
pnpm --filter marketing deploy
```

### Environment Variables (Production)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `SESSION_SECRET` | Yes | JWT secret (min 16 characters) |
| `APP_ENV` | No | `development`, `staging`, or `production` |
| `PUBLIC_MARKETING_URL` | No | Marketing site URL for CORS |

## Mobile App (Capacitor)

### Setup Android

```bash
cd apps/web
npx cap add android
npx cap sync
npx cap open android
```

### Build Android APK

```bash
cd apps/web/android
./gradlew assembleDebug
```

## Anti-Fraud Features

The system includes configurable anti-fraud rules:

- **Photo Required**: Require photo on check-in
- **Geofence Enforcement**: Verify location within customer's geofence
- **GPS Accuracy Threshold**: Flag visits with poor GPS accuracy
- **Spam Detection**: Flag rapid successive check-ins

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### Commit Message Convention

Follow conventional commits:
- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance
- `test`: Tests
- `docs`: Documentation
- `refactor`: Code refactoring

## License

Private - All rights reserved

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/arifin-iskandar/sales-canvassing/issues) page.
