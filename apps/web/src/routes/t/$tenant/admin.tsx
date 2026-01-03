/**
 * Internal Admin Layout
 *
 * Admin section for:
 * - AI Agent configuration and workflow
 * - System settings
 * - User management
 * - Audit logs
 */
import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import {
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline'

export const Route = createFileRoute('/t/$tenant/admin')({
  component: AdminLayout,
  beforeLoad: ({ context }) => {
    // Only owner and admin can access internal admin
    const allowedRoles = ['owner', 'admin']
    if (!context.session || !allowedRoles.includes(context.session.role)) {
      throw new Error('Forbidden: Admin access required')
    }
  },
})

function AdminLayout() {
  const location = useLocation()
  const { tenant } = Route.useParams()

  const navItems = [
    {
      name: 'AI Agent',
      href: `/t/${tenant}/admin/agent`,
      icon: ChatBubbleLeftRightIcon,
      description: 'Configure AI assistant and view workflows',
    },
    {
      name: 'Users',
      href: `/t/${tenant}/admin/users`,
      icon: UsersIcon,
      description: 'Manage user access and roles',
    },
    {
      name: 'Support',
      href: `/t/${tenant}/admin/support`,
      icon: LifebuoyIcon,
      description: 'Customer support tickets',
    },
    {
      name: 'Billing',
      href: `/t/${tenant}/admin/billing`,
      icon: CreditCardIcon,
      description: 'Subscription and invoices',
    },
    {
      name: 'Audit Log',
      href: `/t/${tenant}/admin/audit`,
      icon: ClipboardDocumentListIcon,
      description: 'View system activity logs',
    },
    {
      name: 'System',
      href: `/t/${tenant}/admin/system`,
      icon: Cog6ToothIcon,
      description: 'System tools and config',
    },
  ]

  return (
    <div className="flex h-full">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r bg-slate-50 p-4">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Admin</h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
