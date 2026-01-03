/**
 * Billing & Subscription Admin Page
 */
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  CreditCardIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  DocumentTextIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'

export const Route = createFileRoute('/t/$tenant/admin/billing')({
  component: BillingAdminPage,
})

// Demo subscription data
const DEMO_SUBSCRIPTION = {
  plan: 'Professional',
  status: 'active',
  price: 499000,
  billingCycle: 'monthly',
  currentPeriodStart: '2024-01-01',
  currentPeriodEnd: '2024-01-31',
  usersLimit: 20,
  usersUsed: 6,
  customersLimit: 500,
  customersUsed: 127,
  storageLimit: '10 GB',
  storageUsed: '2.3 GB',
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 199000,
    users: 5,
    customers: 100,
    storage: '2 GB',
    features: ['Basic Reports', 'Email Support', 'Mobile App'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 499000,
    users: 20,
    customers: 500,
    storage: '10 GB',
    features: ['Advanced Reports', 'Priority Support', 'API Access', 'AI Assistant'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999000,
    users: 'Unlimited',
    customers: 'Unlimited',
    storage: '50 GB',
    features: ['Custom Reports', 'Dedicated Support', 'API Access', 'AI Assistant', 'SSO', 'Custom Domain'],
  },
]

const INVOICES = [
  { id: 'INV-2024-001', date: '2024-01-01', amount: 499000, status: 'paid' },
  { id: 'INV-2023-012', date: '2023-12-01', amount: 499000, status: 'paid' },
  { id: 'INV-2023-011', date: '2023-11-01', amount: 499000, status: 'paid' },
  { id: 'INV-2023-010', date: '2023-10-01', amount: 499000, status: 'paid' },
]

function BillingAdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'invoices'>('overview')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing & Subscription</h1>
        <p className="text-slate-600">Manage your subscription and billing</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'plans', name: 'Plans' },
            { id: 'invoices', name: 'Invoices' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Current Plan */}
          <div className="rounded-lg border bg-white p-6 lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Current Plan</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">{DEMO_SUBSCRIPTION.plan}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    <CheckCircleIcon className="h-3 w-3" />
                    Active
                  </span>
                </div>
                <p className="mt-1 text-slate-600">
                  {formatCurrency(DEMO_SUBSCRIPTION.price)}/bulan
                </p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <ArrowUpIcon className="h-4 w-4" />
                Upgrade
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-slate-500">Users</p>
                <p className="mt-1 text-xl font-semibold">
                  {DEMO_SUBSCRIPTION.usersUsed} / {DEMO_SUBSCRIPTION.usersLimit}
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${(DEMO_SUBSCRIPTION.usersUsed / DEMO_SUBSCRIPTION.usersLimit) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Customers</p>
                <p className="mt-1 text-xl font-semibold">
                  {DEMO_SUBSCRIPTION.customersUsed} / {DEMO_SUBSCRIPTION.customersLimit}
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${(DEMO_SUBSCRIPTION.customersUsed / DEMO_SUBSCRIPTION.customersLimit) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Storage</p>
                <p className="mt-1 text-xl font-semibold">
                  {DEMO_SUBSCRIPTION.storageUsed} / {DEMO_SUBSCRIPTION.storageLimit}
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 w-[23%] rounded-full bg-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">Billing Info</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <CreditCardIcon className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900">•••• •••• •••• 4242</p>
                  <p className="text-xs text-slate-500">Expires 12/25</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Next billing date</p>
                  <p className="text-xs text-slate-500">1 Feb 2024</p>
                </div>
              </div>
              <button className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Update Payment Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg border bg-white p-6 ${
                plan.popular ? 'border-blue-500 ring-1 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-0.5 text-xs font-medium text-white">
                  Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                <span className="text-slate-500">/bulan</span>
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  {plan.users} users
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  {plan.customers} customers
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  {plan.storage} storage
                </li>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full rounded-md px-4 py-2 text-sm font-medium ${
                  plan.id === 'professional'
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={plan.id === 'professional'}
              >
                {plan.id === 'professional' ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="rounded-lg border bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Invoice</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {INVOICES.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{invoice.id}</td>
                  <td className="px-4 py-3 text-slate-500">{invoice.date}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(invoice.amount)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      <CheckCircleIcon className="h-3 w-3" />
                      Paid
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                      <DocumentTextIcon className="h-4 w-4" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
