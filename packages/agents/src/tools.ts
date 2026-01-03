/**
 * Pre-built Tools for Sales Canvassing Agents
 *
 * These tools can be registered with agents to provide domain-specific functionality
 */

import { z } from 'zod'
import type { AgentContext, AgentTool } from './types'
import { createTool } from './base'

/**
 * Tool: Get customer details
 */
export const getCustomerTool = createTool(
  'get_customer',
  'Get details about a specific customer including balance, visit history, and contact info',
  z.object({
    customerId: z.string().uuid().describe('The customer ID'),
  }),
  async (params, context) => {
    // This would be implemented to fetch from database
    // Placeholder for now
    return {
      id: params.customerId,
      tenantId: context.tenantId,
      message: 'Customer lookup - implement with database query',
    }
  },
)

/**
 * Tool: Search customers
 */
export const searchCustomersTool = createTool(
  'search_customers',
  'Search for customers by name, code, phone, or address',
  z.object({
    query: z.string().describe('Search query'),
    limit: z.number().int().min(1).max(50).optional().default(10),
  }),
  async (params, context) => {
    return {
      query: params.query,
      limit: params.limit,
      tenantId: context.tenantId,
      message: 'Customer search - implement with database query',
    }
  },
)

/**
 * Tool: Get aging report
 */
export const getAgingReportTool = createTool(
  'get_aging_report',
  'Get accounts receivable aging report showing overdue balances by aging bucket',
  z.object({
    branchId: z.string().uuid().optional().describe('Filter by branch'),
    asOfDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('As of date (YYYY-MM-DD)'),
  }),
  async (params, context) => {
    return {
      branchId: params.branchId,
      asOfDate: params.asOfDate || new Date().toISOString().split('T')[0],
      tenantId: context.tenantId,
      message: 'Aging report - implement with database query',
    }
  },
)

/**
 * Tool: Get visit history
 */
export const getVisitHistoryTool = createTool(
  'get_visit_history',
  'Get visit history for a customer or user within a date range',
  z.object({
    customerId: z.string().uuid().optional().describe('Filter by customer'),
    userId: z.string().uuid().optional().describe('Filter by sales/collector'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Start date'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('End date'),
  }),
  async (params, context) => {
    return {
      ...params,
      tenantId: context.tenantId,
      message: 'Visit history - implement with database query',
    }
  },
)

/**
 * Tool: Get route details
 */
export const getRouteTool = createTool(
  'get_route',
  'Get details about a sales route including assigned stops and completion status',
  z.object({
    routeId: z.string().uuid().optional().describe('Specific route ID'),
    userId: z.string().uuid().optional().describe('Get route for user'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Route date'),
  }),
  async (params, context) => {
    return {
      ...params,
      tenantId: context.tenantId,
      message: 'Route details - implement with database query',
    }
  },
)

/**
 * Tool: Get invoice details
 */
export const getInvoiceTool = createTool(
  'get_invoice',
  'Get details about a specific invoice including items, payments, and balance',
  z.object({
    invoiceId: z.string().uuid().optional().describe('Invoice ID'),
    invoiceNumber: z.string().optional().describe('Invoice number'),
  }),
  async (params, context) => {
    if (!params.invoiceId && !params.invoiceNumber) {
      throw new Error('Either invoiceId or invoiceNumber is required')
    }
    return {
      ...params,
      tenantId: context.tenantId,
      message: 'Invoice details - implement with database query',
    }
  },
)

/**
 * Tool: Get sales summary
 */
export const getSalesSummaryTool = createTool(
  'get_sales_summary',
  'Get sales summary statistics for a period including totals, averages, and trends',
  z.object({
    period: z.enum(['today', 'week', 'month', 'quarter', 'year']).describe('Time period'),
    branchId: z.string().uuid().optional().describe('Filter by branch'),
    userId: z.string().uuid().optional().describe('Filter by sales person'),
  }),
  async (params, context) => {
    return {
      ...params,
      tenantId: context.tenantId,
      message: 'Sales summary - implement with database query',
    }
  },
)

/**
 * Tool: Get collection summary
 */
export const getCollectionSummaryTool = createTool(
  'get_collection_summary',
  'Get collection summary including total collected, pending, and collector performance',
  z.object({
    period: z.enum(['today', 'week', 'month']).describe('Time period'),
    branchId: z.string().uuid().optional().describe('Filter by branch'),
    collectorId: z.string().uuid().optional().describe('Filter by collector'),
  }),
  async (params, context) => {
    return {
      ...params,
      tenantId: context.tenantId,
      message: 'Collection summary - implement with database query',
    }
  },
)

/**
 * Tool: Analyze fraud indicators
 */
export const analyzeFraudTool = createTool(
  'analyze_fraud',
  'Analyze visit data for potential fraud indicators like geofence violations or rapid check-ins',
  z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Start date'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('End date'),
    userId: z.string().uuid().optional().describe('Filter by user'),
  }),
  async (params, context) => {
    // Only supervisors and above can access fraud analysis
    const allowedRoles = ['owner', 'admin', 'supervisor']
    if (!allowedRoles.includes(context.userRole)) {
      throw new Error('Insufficient permissions for fraud analysis')
    }
    return {
      ...params,
      tenantId: context.tenantId,
      message: 'Fraud analysis - implement with database query',
    }
  },
)

/**
 * Get all available tools
 */
export function getAllTools(): AgentTool[] {
  return [
    getCustomerTool,
    searchCustomersTool,
    getAgingReportTool,
    getVisitHistoryTool,
    getRouteTool,
    getInvoiceTool,
    getSalesSummaryTool,
    getCollectionSummaryTool,
    analyzeFraudTool,
  ]
}

/**
 * Get tools for a specific role
 */
export function getToolsForRole(role: AgentContext['userRole']): AgentTool[] {
  const baseTools = [
    getCustomerTool,
    searchCustomersTool,
    getRouteTool,
  ]

  switch (role) {
    case 'owner':
    case 'admin':
      return getAllTools()

    case 'supervisor':
      return [
        ...baseTools,
        getAgingReportTool,
        getVisitHistoryTool,
        getInvoiceTool,
        getSalesSummaryTool,
        getCollectionSummaryTool,
        analyzeFraudTool,
      ]

    case 'sales':
      return [
        ...baseTools,
        getVisitHistoryTool,
        getInvoiceTool,
        getSalesSummaryTool,
      ]

    case 'collector':
      return [
        ...baseTools,
        getAgingReportTool,
        getVisitHistoryTool,
        getCollectionSummaryTool,
      ]

    default:
      return baseTools
  }
}
