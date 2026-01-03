/**
 * User Management Admin Page
 */
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

export const Route = createFileRoute('/t/$tenant/admin/users')({
  component: UsersAdminPage,
})

// Demo users data
const DEMO_USERS = [
  { id: '1', email: 'owner@demo.com', name: 'Budi Santoso', role: 'owner', status: 'active', lastLogin: '2024-01-20 09:30' },
  { id: '2', email: 'admin@demo.com', name: 'Siti Rahayu', role: 'admin', status: 'active', lastLogin: '2024-01-20 08:15' },
  { id: '3', email: 'supervisor@demo.com', name: 'Agus Wijaya', role: 'supervisor', status: 'active', lastLogin: '2024-01-19 17:45' },
  { id: '4', email: 'sales1@demo.com', name: 'Dewi Lestari', role: 'sales', status: 'active', lastLogin: '2024-01-20 07:00' },
  { id: '5', email: 'sales2@demo.com', name: 'Rizki Pratama', role: 'sales', status: 'inactive', lastLogin: '2024-01-15 14:20' },
  { id: '6', email: 'collector@demo.com', name: 'Eka Putra', role: 'collector', status: 'active', lastLogin: '2024-01-20 06:45' },
]

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800',
  supervisor: 'bg-blue-100 text-blue-800',
  sales: 'bg-green-100 text-green-800',
  collector: 'bg-orange-100 text-orange-800',
}

function UsersAdminPage() {
  const [users] = useState(DEMO_USERS)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600">Manage user access and permissions</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <UserPlusIcon className="h-5 w-5" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <select className="rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <option value="">All Roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="supervisor">Supervisor</option>
          <option value="sales">Sales</option>
          <option value="collector">Collector</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">User</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Last Login</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                    <ShieldCheckIcon className="h-3 w-3" />
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <XCircleIcon className="h-4 w-4" />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{user.lastLogin}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
