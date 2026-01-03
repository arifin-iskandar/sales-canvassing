/**
 * Session context for authentication state
 */
import { createContext, useContext, useState, type ReactNode } from 'react'

type SessionUser = {
  id: string
  email?: string
  phone?: string
  name?: string
  role: 'owner' | 'admin' | 'supervisor' | 'sales' | 'collector'
}

type SessionTenant = {
  id: string
  slug: string
  name: string
}

type SessionContextValue = {
  user: SessionUser | null
  tenant: SessionTenant | null
  isAuthenticated: boolean
  setSession: (user: SessionUser | null, tenant: SessionTenant | null) => void
  clearSession: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

type SessionProviderProps = {
  initialUser?: SessionUser | null
  initialTenant?: SessionTenant | null
  children: ReactNode
}

export function SessionProvider({
  initialUser = null,
  initialTenant = null,
  children,
}: SessionProviderProps) {
  const [user, setUser] = useState<SessionUser | null>(initialUser)
  const [tenant, setTenant] = useState<SessionTenant | null>(initialTenant)

  const setSession = (
    newUser: SessionUser | null,
    newTenant: SessionTenant | null,
  ) => {
    setUser(newUser)
    setTenant(newTenant)
  }

  const clearSession = () => {
    setUser(null)
    setTenant(null)
  }

  return (
    <SessionContext.Provider
      value={{
        user,
        tenant,
        isAuthenticated: !!user,
        setSession,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

export function useSessionOptional(): SessionContextValue | null {
  return useContext(SessionContext)
}
