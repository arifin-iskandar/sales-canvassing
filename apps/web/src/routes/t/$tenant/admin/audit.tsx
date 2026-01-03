/**
 * Audit Log Admin Page
 *
 * Features:
 * - System activity logs
 * - User action tracking
 * - Filterable by date, user, action type
 */
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ClockIcon,
  FunnelIcon,
  UserCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

export const Route = createFileRoute('/t/$tenant/admin/audit')({
  component: AuditLogPage,
})

// Demo audit log data
const DEMO_AUDIT_LOGS = [
  {
    id: '1',
    timestamp: '2024-01-20 10:30:45',
    user: 'Budi Santoso',
    userId: 'user-1',
    action: 'customer.create',
    resource: 'Customer',
    resourceId: 'cust-127',
    details: 'Created customer: Toko Maju Jaya',
    ipAddress: '103.28.12.45',
  },
  {
    id: '2',
    timestamp: '2024-01-20 10:15:22',
    user: 'Dewi Lestari',
    userId: 'user-4',
    action: 'visit.checkin',
    resource: 'Visit',
    resourceId: 'visit-456',
    details: 'Check-in at Warung Berkah (-6.2088, 106.8456)',
    ipAddress: '103.28.12.78',
  },
  {
    id: '3',
    timestamp: '2024-01-20 09:45:10',
    user: 'Eka Putra',
    userId: 'user-6',
    action: 'payment.create',
    resource: 'Payment',
    resourceId: 'pay-789',
    details: 'Recorded payment Rp 2.500.000 for INV-2024-001',
    ipAddress: '103.28.12.92',
  },
  {
    id: '4',
    timestamp: '2024-01-20 09:30:00',
    user: 'Siti Rahayu',
    userId: 'user-2',
    action: 'user.update',
    resource: 'User',
    resourceId: 'user-5',
    details: 'Updated user role: Rizki Pratama (sales → inactive)',
    ipAddress: '103.28.12.45',
  },
  {
    id: '5',
    timestamp: '2024-01-20 08:00:15',
    user: 'Agus Wijaya',
    userId: 'user-3',
    action: 'route.assign',
    resource: 'Route',
    resourceId: 'route-12',
    details: 'Assigned route Rute Jakarta Selatan to Dewi Lestari',
    ipAddress: '103.28.12.56',
  },
  {
    id: '6',
    timestamp: '2024-01-19 16:45:30',
    user: 'Budi Santoso',
    userId: 'user-1',
    action: 'invoice.create',
    resource: 'Invoice',
    resourceId: 'inv-890',
    details: 'Created invoice INV-2024-015 for Rp 5.000.000',
    ipAddress: '103.28.12.45',
  },
  {
    id: '7',
    timestamp: '2024-01-19 15:20:00',
    user: 'Dewi Lestari',
    userId: 'user-4',
    action: 'customer.update',
    resource: 'Customer',
    resourceId: 'cust-89',
    details: 'Updated customer address: Minimarket Sinar',
    ipAddress: '103.28.12.78',
  },
  {
    id: '8',
    timestamp: '2024-01-19 14:00:00',
    user: 'System',
    userId: 'system',
    action: 'sync.complete',
    resource: 'Sync',
    resourceId: 'sync-123',
    details: 'Mobile sync completed: 15 events uploaded',
    ipAddress: 'internal',
  },
]

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'customer.create': UserPlusIcon,
  'customer.update': PencilIcon,
  'customer.delete': TrashIcon,
  'visit.checkin': MapPinIcon,
  'visit.checkout': MapPinIcon,
  'payment.create': CurrencyDollarIcon,
  'invoice.create': DocumentTextIcon,
  'user.update': UserCircleIcon,
  'route.assign': ArrowPathIcon,
  'sync.complete': ArrowPathIcon,
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  checkin: 'bg-purple-100 text-purple-700',
  checkout: 'bg-purple-100 text-purple-700',
  assign: 'bg-orange-100 text-orange-700',
  complete: 'bg-slate-100 text-slate-700',
}

function getActionColor(action: string): string {
  const actionType = action.split('.')[1]
  return ACTION_COLORS[actionType] || 'bg-slate-100 text-slate-700'
}

function AuditLogPage() {
  const [logs] = useState(DEMO_AUDIT_LOGS)
  const [filterAction, setFilterAction] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredLogs = logs.filter((log) => {
    if (filterAction && !log.action.includes(filterAction)) return false
    if (filterUser && !log.user.toLowerCase().includes(filterUser.toLowerCase())) return false
    return true
  })

  const uniqueActions = [...new Set(logs.map((l) => l.action.split('.')[0]))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
          <p className="text-slate-600">Track all system activities and user actions</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <FunnelIcon className="h-5 w-5" />
          Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-lg border bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Action Type</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">User</label>
              <input
                type="text"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                placeholder="Search by user..."
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Date Range</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Timestamp</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">User</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Details</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredLogs.map((log) => {
              const Icon = ACTION_ICONS[log.action] || DocumentTextIcon
              return (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <ClockIcon className="h-4 w-4 text-slate-400" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <UserCircleIcon className="h-6 w-6 text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-900">{log.user}</div>
                        <div className="text-xs text-slate-500">{log.ipAddress}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getActionColor(log.action)}`}
                    >
                      <Icon className="h-3 w-3" />
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-md">
                      <p className="text-sm text-slate-900">{log.details}</p>
                      <p className="text-xs text-slate-500">
                        {log.resource} ID: {log.resourceId}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing <span className="font-medium">{filteredLogs.length}</span> of{' '}
          <span className="font-medium">{logs.length}</span> entries
        </p>
        <div className="flex gap-2">
          <button className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50">
            Previous
          </button>
          <button className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
