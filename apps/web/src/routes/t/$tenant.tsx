/**
 * Tenant layout - wraps all tenant-scoped routes
 */
import { Outlet, createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router'
import { TenantProvider } from '@/lib/tenantContext'
import { useSession } from '@/lib/sessionContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/api/client'
import {
  Home,
  Users,
  MapPin,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@canvassing/ui'

export const Route = createFileRoute('/t/$tenant')({
  beforeLoad: ({ context, params }) => {
    // @ts-expect-error - context type
    const session = context?.serverContext?.session
    if (!session) {
      throw redirect({ to: '/login' })
    }
    // Basic tenant access check
    if (session.slug !== params.tenant && session.tenant !== params.tenant) {
      throw redirect({ to: '/login' })
    }
    return { session }
  },
  loader: ({ context, params }) => {
    // @ts-expect-error - context type
    const session = context.serverContext?.session
    return {
      tenant: {
        id: session?.tenant ?? params.tenant,
        slug: session?.slug ?? params.tenant,
        name: session?.name ?? 'Tenant',
      },
    }
  },
  component: TenantLayout,
})

function TenantLayout() {
  const { tenant } = Route.useLoaderData()
  const { user, clearSession } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      clearSession()
      queryClient.clear()
      navigate({ to: '/login' })
    },
  })

  const navItems = [
    { to: `/t/${tenant.slug}/dashboard`, icon: Home, label: 'Dashboard' },
    { to: `/t/${tenant.slug}/customers`, icon: Users, label: 'Pelanggan' },
    { to: `/t/${tenant.slug}/routes`, icon: MapPin, label: 'Rute' },
    { to: `/t/${tenant.slug}/invoices`, icon: FileText, label: 'Invoice' },
    { to: `/t/${tenant.slug}/payments`, icon: CreditCard, label: 'Pembayaran' },
    { to: `/t/${tenant.slug}/reports`, icon: BarChart3, label: 'Laporan' },
    { to: `/t/${tenant.slug}/settings`, icon: Settings, label: 'Pengaturan' },
  ]

  return (
    <TenantProvider value={tenant}>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform lg:translate-x-0 lg:static lg:shadow-none`}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <span className="text-lg font-semibold text-gray-900">
                {tenant.name}
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close sidebar</span>
                &times;
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  activeProps={{
                    className: 'bg-blue-50 text-blue-700',
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User info */}
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Keluar"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="h-16 bg-white border-b flex items-center px-4 gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1" />
            {/* Additional header items can go here */}
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </TenantProvider>
  )
}
