/**
 * Tenant context for multi-tenant routing
 */
import { createContext, useContext, type ReactNode } from 'react'

type TenantContextValue = {
  tenantId: string | null
  tenantSlug: string | null
  tenantName: string | null
  buildPath: (path?: string) => string
  buildApiPath: (path?: string) => string
}

const TenantContext = createContext<TenantContextValue | null>(null)

type TenantProviderProps = {
  value: {
    id: string | null
    slug: string | null
    name: string | null
  }
  children: ReactNode
}

export function TenantProvider({ value, children }: TenantProviderProps) {
  const tenantKey = value.slug || value.id

  const contextValue: TenantContextValue = {
    tenantId: value.id,
    tenantSlug: value.slug,
    tenantName: value.name,
    buildPath: (path = '') => {
      if (!tenantKey) return path
      const cleanPath = path.startsWith('/') ? path : `/${path}`
      return `/t/${tenantKey}${cleanPath}`
    },
    buildApiPath: (path = '') => {
      if (!tenantKey) return `/api${path.startsWith('/') ? path : `/${path}`}`
      const cleanPath = path.startsWith('/') ? path : `/${path}`
      return `/api/t/${tenantKey}${cleanPath}`
    },
  }

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenantContext(): TenantContextValue {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantProvider')
  }
  return context
}

export function useTenantContextOptional(): TenantContextValue | null {
  return useContext(TenantContext)
}
