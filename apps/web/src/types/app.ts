/**
 * Application type definitions
 */
import type { SessionSummary } from '../server/session'

export interface TenantInfo {
  id: string
  slug: string
  name: string
}

export interface AppRouterContext {
  serverContext: unknown
  tenant: TenantInfo | null | undefined
  sessionData: SessionSummary | null | undefined
}
