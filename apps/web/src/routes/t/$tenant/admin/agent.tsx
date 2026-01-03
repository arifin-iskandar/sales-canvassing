/**
 * AI Agent Administration Page
 *
 * Features:
 * - Agent configuration (model, temperature, capabilities)
 * - Workflow visualization
 * - Tool registry display
 * - Conversation logs
 * - Test chat interface
 */
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  PlayIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export const Route = createFileRoute('/t/$tenant/admin/agent')({
  component: AgentAdminPage,
})

// Agent capabilities with descriptions
const AGENT_CAPABILITIES = [
  {
    id: 'route_optimization',
    name: 'Route Optimization',
    description: 'Suggest optimal visit sequences to minimize travel time',
    icon: '🗺️',
  },
  {
    id: 'fraud_detection',
    name: 'Fraud Detection',
    description: 'Identify suspicious visit patterns and anomalies',
    icon: '🔍',
  },
  {
    id: 'collection_priority',
    name: 'Collection Priority',
    description: 'Prioritize collection efforts based on risk and balance',
    icon: '💰',
  },
  {
    id: 'sales_insights',
    name: 'Sales Insights',
    description: 'Analyze sales performance and trends',
    icon: '📊',
  },
  {
    id: 'customer_analysis',
    name: 'Customer Analysis',
    description: 'Analyze customer behavior and purchase patterns',
    icon: '👥',
  },
  {
    id: 'general_assistant',
    name: 'General Assistant',
    description: 'Answer general questions and help with navigation',
    icon: '💬',
  },
]

// Agent tools with role access
const AGENT_TOOLS = [
  { id: 'get_customer', name: 'Get Customer', roles: ['all'], description: 'Retrieve customer details' },
  { id: 'search_customers', name: 'Search Customers', roles: ['all'], description: 'Search customer database' },
  { id: 'get_route', name: 'Get Route', roles: ['all'], description: 'Get route details and stops' },
  { id: 'get_visit_history', name: 'Visit History', roles: ['sales', 'supervisor', 'admin'], description: 'Query visit event log' },
  { id: 'get_invoice', name: 'Get Invoice', roles: ['sales', 'supervisor', 'admin'], description: 'Retrieve invoice details' },
  { id: 'get_aging_report', name: 'Aging Report', roles: ['collector', 'supervisor', 'admin'], description: 'AR aging buckets' },
  { id: 'get_sales_summary', name: 'Sales Summary', roles: ['sales', 'supervisor', 'admin'], description: 'Sales statistics' },
  { id: 'get_collection_summary', name: 'Collection Summary', roles: ['collector', 'supervisor', 'admin'], description: 'Collection stats' },
  { id: 'analyze_fraud', name: 'Fraud Analysis', roles: ['supervisor', 'admin'], description: 'Detect fraud patterns' },
]

// Agent workflow steps
const AGENT_WORKFLOW = [
  {
    step: 1,
    name: 'Receive Message',
    description: 'User sends a message to the AI assistant',
    icon: '📩',
  },
  {
    step: 2,
    name: 'Context Injection',
    description: 'System injects tenant, user, and role context',
    icon: '🔐',
  },
  {
    step: 3,
    name: 'Tool Selection',
    description: 'Agent determines which tools are needed based on query',
    icon: '🛠️',
  },
  {
    step: 4,
    name: 'Data Retrieval',
    description: 'Agent executes tools to fetch relevant data from database',
    icon: '📊',
  },
  {
    step: 5,
    name: 'Analysis',
    description: 'Agent analyzes data and generates insights',
    icon: '🧠',
  },
  {
    step: 6,
    name: 'Response',
    description: 'Agent responds in Indonesian with actionable recommendations',
    icon: '💬',
  },
]

function AgentAdminPage() {
  const [activeTab, setActiveTab] = useState<'config' | 'workflow' | 'tools' | 'test'>('config')
  const [enabledCapabilities, setEnabledCapabilities] = useState<string[]>([
    'general_assistant',
    'fraud_detection',
    'collection_priority',
  ])
  const [testMessage, setTestMessage] = useState('')
  const [testResponse, setTestResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const toggleCapability = (id: string) => {
    setEnabledCapabilities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const handleTestChat = async () => {
    if (!testMessage.trim()) return
    setIsLoading(true)
    setTestResponse('')

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setTestResponse(
      `[Demo Response]\n\nBerdasarkan analisis data, berikut adalah rekomendasi:\n\n1. Prioritaskan kunjungan ke Toko Maju Jaya - saldo tertunggak Rp 1.500.000\n2. Rute optimal: Fatmawati → Kemang → Radio Dalam\n3. Tidak ditemukan indikasi fraud pada data kunjungan minggu ini\n\nApakah ada yang perlu saya bantu lagi?`
    )
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Agent Configuration</h1>
          <p className="text-slate-600">
            Configure AI assistant capabilities, view workflows, and test interactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
            <CheckCircleIcon className="h-4 w-4" />
            Agent Active
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          {[
            { id: 'config', name: 'Configuration', icon: Cog6ToothIcon },
            { id: 'workflow', name: 'Workflow', icon: ArrowPathIcon },
            { id: 'tools', name: 'Tools Registry', icon: WrenchScrewdriverIcon },
            { id: 'test', name: 'Test Chat', icon: ChatBubbleLeftRightIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
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

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Model Settings */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Model Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Provider</label>
                <select className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="openai">OpenAI</option>
                  <option value="anthropic" disabled>Anthropic (Coming Soon)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Model</label>
                <select className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Temperature: 0.7
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                  className="mt-1 w-full"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Lower = more focused, Higher = more creative
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Max Tokens</label>
                <input
                  type="number"
                  defaultValue={2048}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Enabled Capabilities</h3>
            <div className="space-y-3">
              {AGENT_CAPABILITIES.map((cap) => (
                <label
                  key={cap.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={enabledCapabilities.includes(cap.id)}
                    onChange={() => toggleCapability(cap.id)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{cap.icon}</span>
                      <span className="font-medium text-slate-900">{cap.name}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">{cap.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* System Prompt Preview */}
          <div className="rounded-lg border bg-white p-6 lg:col-span-2">
            <h3 className="mb-4 text-lg font-semibold">System Prompt Preview</h3>
            <pre className="max-h-64 overflow-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
{`You are an AI assistant for a sales canvassing and collection tracking system in Indonesia.
You help sales teams, collectors, and supervisors manage their field operations.

Current capabilities enabled:
${enabledCapabilities.map((c) => `- ${AGENT_CAPABILITIES.find((cap) => cap.id === c)?.name}`).join('\n')}

Always respond in Indonesian (Bahasa Indonesia) unless the user writes in English.
Use Indonesian Rupiah (IDR) for all monetary values.
Format dates in Indonesian style (DD/MM/YYYY).`}
            </pre>
          </div>
        </div>
      )}

      {/* Workflow Tab */}
      {activeTab === 'workflow' && (
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-6 text-lg font-semibold">Agent Workflow</h3>
          <div className="relative">
            {/* Workflow Steps */}
            <div className="space-y-0">
              {AGENT_WORKFLOW.map((step, index) => (
                <div key={step.step} className="relative flex gap-4 pb-8">
                  {/* Connector Line */}
                  {index < AGENT_WORKFLOW.length - 1 && (
                    <div className="absolute left-6 top-12 h-full w-0.5 bg-slate-200" />
                  )}

                  {/* Step Number */}
                  <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl">
                    {step.icon}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pt-2">
                    <h4 className="font-semibold text-slate-900">
                      Step {step.step}: {step.name}
                    </h4>
                    <p className="mt-1 text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Diagram */}
          <div className="mt-8 rounded-lg bg-slate-50 p-6">
            <h4 className="mb-4 font-semibold text-slate-900">Data Flow Diagram</h4>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <div className="rounded bg-blue-100 px-3 py-2 text-blue-800">User Message</div>
              <span className="text-slate-400">→</span>
              <div className="rounded bg-purple-100 px-3 py-2 text-purple-800">Context + Auth</div>
              <span className="text-slate-400">→</span>
              <div className="rounded bg-orange-100 px-3 py-2 text-orange-800">OpenAI API</div>
              <span className="text-slate-400">→</span>
              <div className="rounded bg-green-100 px-3 py-2 text-green-800">Tool Execution</div>
              <span className="text-slate-400">→</span>
              <div className="rounded bg-cyan-100 px-3 py-2 text-cyan-800">Database Query</div>
              <span className="text-slate-400">→</span>
              <div className="rounded bg-pink-100 px-3 py-2 text-pink-800">Response</div>
            </div>
          </div>
        </div>
      )}

      {/* Tools Registry Tab */}
      {activeTab === 'tools' && (
        <div className="rounded-lg border bg-white">
          <div className="border-b p-4">
            <h3 className="text-lg font-semibold">Registered Tools</h3>
            <p className="text-sm text-slate-600">
              Tools are automatically filtered based on user role
            </p>
          </div>
          <div className="divide-y">
            {AGENT_TOOLS.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-sm font-mono text-slate-800">
                      {tool.id}
                    </code>
                    <span className="font-medium text-slate-900">{tool.name}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{tool.description}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tool.roles.map((role) => (
                    <span
                      key={role}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        role === 'all'
                          ? 'bg-green-100 text-green-700'
                          : role === 'admin'
                            ? 'bg-red-100 text-red-700'
                            : role === 'supervisor'
                              ? 'bg-purple-100 text-purple-700'
                              : role === 'sales'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Chat Tab */}
      {activeTab === 'test' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Test Chat</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Test as Role</label>
                <select className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="admin">Admin</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="sales">Sales</option>
                  <option value="collector">Collector</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Message</label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Contoh: Tampilkan laporan aging bulan ini"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleTestChat}
                disabled={isLoading || !testMessage.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-slate-400"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-5 w-5" />
                    Send Test Message
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Response</h3>
            {testResponse ? (
              <div className="rounded-lg bg-slate-50 p-4">
                <pre className="whitespace-pre-wrap text-sm text-slate-800">{testResponse}</pre>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-slate-400">
                Send a test message to see the response
              </div>
            )}
          </div>

          {/* Example Prompts */}
          <div className="rounded-lg border bg-white p-6 lg:col-span-2">
            <h3 className="mb-4 text-lg font-semibold">Example Prompts</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                'Tampilkan laporan aging bulan ini',
                'Siapa customer dengan tunggakan terbesar?',
                'Optimasi rute kunjungan hari ini',
                'Ada indikasi fraud minggu ini?',
                'Ringkasan performa sales bulan ini',
                'Customer mana yang perlu di-follow up?',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setTestMessage(prompt)}
                  className="rounded-lg border border-slate-200 p-3 text-left text-sm text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
