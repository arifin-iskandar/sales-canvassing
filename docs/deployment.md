# Deployment Guide

This document describes how to deploy the Sales Canvassing application to Cloudflare.

## Prerequisites

1. Cloudflare account with Workers and R2 access
2. Wrangler CLI installed and authenticated (`npx wrangler login`)
3. Neon Postgres database set up with migrations applied

## Environment Setup

### Create R2 Buckets

Before deploying, create the required R2 buckets in Cloudflare dashboard:

```bash
# Development
wrangler r2 bucket create canvassing-photos-dev

# Staging
wrangler r2 bucket create canvassing-photos-staging

# Production
wrangler r2 bucket create canvassing-photos
```

### Set Secrets

Secrets must be set for each environment:

```bash
# Staging secrets
wrangler secret put DATABASE_URL --env staging
wrangler secret put SESSION_SECRET --env staging

# Production secrets
wrangler secret put DATABASE_URL --env production
wrangler secret put SESSION_SECRET --env production
```

## Web Dashboard Deployment

### Deploy to Staging

```bash
cd apps/web

# Build for staging
CLOUDFLARE_ENV=staging pnpm build

# Deploy to staging (uses workers.dev subdomain)
npx wrangler deploy --env staging

# Result: https://canvassing-web-staging.<your-subdomain>.workers.dev
```

### Deploy to Production

```bash
cd apps/web

# Build for production
CLOUDFLARE_ENV=production pnpm build

# Deploy to production
npx wrangler deploy --env production

# Result: https://canvassing-web.<your-subdomain>.workers.dev
```

### Custom Domain (Production)

To use a custom domain:

1. Add domain in Cloudflare dashboard
2. Update `wrangler.json`:

```json
{
  "env": {
    "production": {
      "routes": [
        { "pattern": "app.canvassing.id", "custom_domain": true }
      ]
    }
  }
}
```

## Marketing Site Deployment

The marketing site uses Cloudflare Pages:

```bash
cd apps/marketing

# Build
pnpm build

# Deploy to Pages
npx wrangler pages deploy dist --project-name=canvassing-marketing

# For staging
npx wrangler pages deploy dist --project-name=canvassing-marketing-staging
```

## Deployment Scripts

Add these to your CI/CD or run manually:

### Full Staging Deployment

```bash
#!/bin/bash
set -e

echo "Building web dashboard..."
cd apps/web
CLOUDFLARE_ENV=staging pnpm build
npx wrangler deploy --env staging

echo "Building marketing site..."
cd ../marketing
pnpm build
npx wrangler pages deploy dist --project-name=canvassing-marketing-staging

echo "Staging deployment complete!"
```

### Verify Deployment

After deployment, verify:

1. **Health Check**: `curl https://canvassing-web-staging.workers.dev/api/auth/me`
2. **Marketing Site**: Visit `https://canvassing-marketing-staging.pages.dev`
3. **Database**: Try logging in with demo credentials

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `SESSION_SECRET` | Yes | JWT signing secret (min 16 chars) |
| `APP_ENV` | No | `development`, `staging`, `production` |
| `PUBLIC_MARKETING_URL` | No | Marketing site URL for CORS |
| `MONEY_DEFAULT_CURRENCY` | No | Default currency (IDR) |

## R2 Bindings

| Binding | Bucket | Purpose |
|---------|--------|---------|
| `PHOTOS` | `canvassing-photos-*` | Visit photos, invoices, receipts |

## Troubleshooting

### Worker Not Starting

Check logs:
```bash
wrangler tail --env staging
```

### Database Connection Failed

1. Verify `DATABASE_URL` is set correctly
2. Check Neon dashboard for connection limits
3. Ensure `?sslmode=require` is in connection string

### Build Errors

```bash
# Clear build cache
rm -rf apps/web/dist
rm -rf apps/web/.vinxi

# Rebuild
pnpm --filter web build
```

## Rollback

To rollback to a previous version:

```bash
# List deployments
wrangler deployments list --env staging

# Rollback to specific version
wrangler rollback <deployment-id> --env staging
```
