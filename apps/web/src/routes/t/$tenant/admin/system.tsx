/**
 * System Tools Admin Page
 *
 * Features:
 * - Database table browser
 * - Query execution (read-only)
 * - System health monitoring
 * - Configuration management
 */
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  CircleStackIcon,
  TableCellsIcon,
  CommandLineIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlayIcon,
  ClockIcon,
  ServerIcon,
  CloudIcon,
  KeyIcon,
} from '@heroicons/react/24/outline'

export const Route = createFileRoute('/t/$tenant/admin/system')({
  component: SystemToolsPage,
})

// Demo database tables
const DB_TABLES = [
  { name: 'tenants', rowCount: 1, size: '16 KB', lastUpdated: '2024-01-20 08:00' },
  { name: 'users', rowCount: 6, size: '24 KB', lastUpdated: '2024-01-20 10:15' },
  { name: 'customers', rowCount: 127, size: '256 KB', lastUpdated: '2024-01-20 10:30' },
  { name: 'branches', rowCount: 3, size: '12 KB', lastUpdated: '2024-01-15 14:00' },
  { name: 'routes', rowCount: 8, size: '48 KB', lastUpdated: '2024-01-20 08:00' },
  { name: 'route_stops', rowCount: 45, size: '64 KB', lastUpdated: '2024-01-20 08:00' },
  { name: 'visit_events', rowCount: 1234, size: '512 KB', lastUpdated: '2024-01-20 10:45' },
  { name: 'invoices', rowCount: 456, size: '320 KB', lastUpdated: '2024-01-20 09:30' },
  { name: 'invoice_items', rowCount: 1890, size: '384 KB', lastUpdated: '2024-01-20 09:30' },
  { name: 'payments', rowCount: 312, size: '192 KB', lastUpdated: '2024-01-20 09:45' },
  { name: 'promise_to_pay', rowCount: 28, size: '32 KB', lastUpdated: '2024-01-19 16:00' },
  { name: 'products', rowCount: 89, size: '96 KB', lastUpdated: '2024-01-10 11:00' },
]

// Demo system health metrics
const SYSTEM_HEALTH = {
  database: { status: 'healthy', latency: '12ms', connections: 5, maxConnections: 100 },
  api: { status: 'healthy', responseTime: '45ms', requestsPerMin: 120 },
  storage: { status: 'healthy', used: '2.3 GB', total: '10 GB', percentage: 23 },
  workers: { status: 'healthy', activeJobs: 2, queuedJobs: 0 },
}

// Demo query result
const DEMO_QUERY_RESULT = {
  columns: ['id', 'name', 'email', 'status', 'created_at'],
  rows: [
    ['cust-001', 'Toko Maju Jaya', 'tokos@example.com', 'active', '2024-01-15'],
    ['cust-002', 'Warung Berkah', 'warung@example.com', 'active', '2024-01-16'],
    ['cust-003', 'Minimarket Sinar', 'mini@example.com', 'inactive', '2024-01-17'],
  ],
  rowCount: 3,
  executionTime: '8ms',
}

// Demo environment config
const ENV_CONFIG = [
  { key: 'APP_ENV', value: 'staging', sensitive: false },
  { key: 'DATABASE_URL', value: 'postgres://****@neon.tech/canvassing', sensitive: true },
  { key: 'JWT_SECRET', value: '****', sensitive: true },
  { key: 'R2_BUCKET', value: 'canvassing-photos-staging', sensitive: false },
  { key: 'OPENAI_API_KEY', value: 'sk-****', sensitive: true },
  { key: 'PUBLIC_MARKETING_URL', value: 'https://canvassing.example.com', sensitive: false },
]

function SystemToolsPage() {
  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'health' | 'config'>('health')
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [queryText, setQueryText] = useState('SELECT * FROM customers WHERE status = \'active\' LIMIT 10;')
  const [queryResult, setQueryResult] = useState<typeof DEMO_QUERY_RESULT | null>(null)
  const [isRunningQuery, setIsRunningQuery] = useState(false)

  const handleRunQuery = async () => {
    setIsRunningQuery(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setQueryResult(DEMO_QUERY_RESULT)
    setIsRunningQuery(false)
  }

  const tabs = [
    { id: 'health', name: 'System Health', icon: CpuChipIcon },
    { id: 'tables', name: 'Database Tables', icon: TableCellsIcon },
    { id: 'query', name: 'Query Console', icon: CommandLineIcon },
    { id: 'config', name: 'Configuration', icon: KeyIcon },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Tools</h1>
        <p className="text-slate-600">Monitor system health and inspect database</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* System Health Tab */}
      {activeTab === 'health' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Database Health */}
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center gap-3">
              <CircleStackIcon className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-slate-900">Database</h3>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Latency</p>
                <p className="text-lg font-semibold">{SYSTEM_HEALTH.database.latency}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Connections</p>
                <p className="text-lg font-semibold">
                  {SYSTEM_HEALTH.database.connections}/{SYSTEM_HEALTH.database.maxConnections}
                </p>
              </div>
            </div>
          </div>

          {/* API Health */}
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center gap-3">
              <ServerIcon className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold text-slate-900">API Server</h3>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Response Time</p>
                <p className="text-lg font-semibold">{SYSTEM_HEALTH.api.responseTime}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Requests/min</p>
                <p className="text-lg font-semibold">{SYSTEM_HEALTH.api.requestsPerMin}</p>
              </div>
            </div>
          </div>

          {/* Storage Health */}
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center gap-3">
              <CloudIcon className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="font-semibold text-slate-900">Storage (R2)</h3>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Used</span>
                <span className="font-medium">
                  {SYSTEM_HEALTH.storage.used} / {SYSTEM_HEALTH.storage.total}
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-orange-500"
                  style={{ width: `${SYSTEM_HEALTH.storage.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Workers Health */}
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center gap-3">
              <CpuChipIcon className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-slate-900">Background Workers</h3>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Active Jobs</p>
                <p className="text-lg font-semibold">{SYSTEM_HEALTH.workers.activeJobs}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Queued</p>
                <p className="text-lg font-semibold">{SYSTEM_HEALTH.workers.queuedJobs}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Tables Tab */}
      {activeTab === 'tables' && (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Table Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Rows</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Size</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Last Updated</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {DB_TABLES.map((table) => (
                <tr
                  key={table.name}
                  className={`hover:bg-slate-50 ${selectedTable === table.name ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TableCellsIcon className="h-5 w-5 text-slate-400" />
                      <span className="font-mono text-sm font-medium text-slate-900">{table.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{table.rowCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{table.size}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <ClockIcon className="h-4 w-4" />
                      {table.lastUpdated}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedTable(table.name)
                        setQueryText(`SELECT * FROM ${table.name} LIMIT 100;`)
                        setActiveTab('query')
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Browse
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Query Console Tab */}
      {activeTab === 'query' && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">SQL Query (Read-only)</label>
              <span className="text-xs text-slate-500">Only SELECT queries are allowed</span>
            </div>
            <textarea
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              rows={4}
              className="block w-full rounded-md border-slate-300 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="SELECT * FROM customers LIMIT 10;"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleRunQuery}
                disabled={isRunningQuery}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isRunningQuery ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    Run Query
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Query Results */}
          {queryResult && (
            <div className="rounded-lg border bg-white">
              <div className="border-b bg-slate-50 px-4 py-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    {queryResult.rowCount} rows returned
                  </span>
                  <span className="text-slate-500">Execution time: {queryResult.executionTime}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {queryResult.columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-500"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {queryResult.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {row.map((cell, j) => (
                          <td key={j} className="whitespace-nowrap px-4 py-2 font-mono text-sm text-slate-600">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="border-b bg-slate-50 px-4 py-3">
            <h3 className="font-medium text-slate-900">Environment Variables</h3>
            <p className="text-sm text-slate-500">Sensitive values are masked</p>
          </div>
          <div className="divide-y divide-slate-200">
            {ENV_CONFIG.map((config) => (
              <div key={config.key} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  {config.sensitive ? (
                    <KeyIcon className="h-5 w-5 text-amber-500" />
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  <span className="font-mono text-sm font-medium text-slate-900">{config.key}</span>
                </div>
                <span className="font-mono text-sm text-slate-600">{config.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
