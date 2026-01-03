/**
 * React Query key factory for cache management
 */

export const queryKeys = {
  // Auth
  auth: {
    me: () => ['auth', 'me'] as const,
  },

  // Customers
  customers: {
    all: () => ['customers'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['customers', 'list', filters] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
    search: (query: string) => ['customers', 'search', query] as const,
  },

  // Routes
  routes: {
    all: () => ['routes'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['routes', 'list', filters] as const,
    detail: (id: string) => ['routes', 'detail', id] as const,
    today: () => ['routes', 'today'] as const,
  },

  // Visits
  visits: {
    all: () => ['visits'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['visits', 'list', filters] as const,
    today: () => ['visits', 'today'] as const,
    byCustomer: (customerId: string) =>
      ['visits', 'customer', customerId] as const,
    byUser: (userId: string, date?: string) =>
      ['visits', 'user', userId, date] as const,
  },

  // Invoices
  invoices: {
    all: () => ['invoices'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['invoices', 'list', filters] as const,
    detail: (id: string) => ['invoices', 'detail', id] as const,
    byCustomer: (customerId: string) =>
      ['invoices', 'customer', customerId] as const,
  },

  // Payments
  payments: {
    all: () => ['payments'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['payments', 'list', filters] as const,
    detail: (id: string) => ['payments', 'detail', id] as const,
    byCustomer: (customerId: string) =>
      ['payments', 'customer', customerId] as const,
  },

  // Reports
  reports: {
    aging: () => ['reports', 'aging'] as const,
    visitSummary: (dateRange?: { start: string; end: string }) =>
      ['reports', 'visits', dateRange] as const,
    exceptions: () => ['reports', 'exceptions'] as const,
  },

  // Settings
  settings: {
    branches: () => ['settings', 'branches'] as const,
    users: () => ['settings', 'users'] as const,
    products: () => ['settings', 'products'] as const,
  },
}
