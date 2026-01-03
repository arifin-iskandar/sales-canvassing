/**
 * Agent SDK Types for Sales Canvassing AI Integration
 *
 * This module provides type definitions for AI agents that can:
 * - Analyze sales data and provide insights
 * - Generate route optimization suggestions
 * - Detect fraud patterns in visit data
 * - Assist with collection prioritization
 * - Answer questions about customer history
 */

import { z } from 'zod'

// Agent provider types
export type AgentProvider = 'openai' | 'anthropic' | 'custom'

// Agent configuration
export interface AgentConfig {
  provider: AgentProvider
  apiKey: string
  model?: string
  maxTokens?: number
  temperature?: number
}

// Context passed to agents
export interface AgentContext {
  tenantId: string
  userId: string
  userRole: 'owner' | 'admin' | 'supervisor' | 'sales' | 'collector'
  locale: string
}

// Agent capabilities
export type AgentCapability =
  | 'route_optimization'
  | 'fraud_detection'
  | 'collection_priority'
  | 'sales_insights'
  | 'customer_analysis'
  | 'general_assistant'

// Tool definitions for function calling
export interface AgentTool {
  name: string
  description: string
  parameters: z.ZodType<unknown>
  execute: (params: unknown, context: AgentContext) => Promise<unknown>
}

// Message types
export interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  toolCallId?: string
  toolCalls?: ToolCall[]
}

export interface ToolCall {
  id: string
  name: string
  arguments: string
}

// Agent response
export interface AgentResponse {
  content: string
  toolCalls?: ToolCall[]
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// Streaming response
export interface AgentStreamChunk {
  type: 'text' | 'tool_call' | 'done'
  content?: string
  toolCall?: ToolCall
}

// Analysis result types
export interface RouteOptimizationResult {
  optimizedStops: Array<{
    customerId: string
    customerName: string
    sequence: number
    estimatedArrival: string
    priority: 'high' | 'medium' | 'low'
    reason?: string
  }>
  totalDistance: number
  estimatedDuration: number
  savings?: {
    distanceReduction: number
    timeReduction: number
  }
}

export interface FraudDetectionResult {
  alerts: Array<{
    type: 'geofence_violation' | 'rapid_checkin' | 'low_accuracy' | 'suspicious_pattern'
    severity: 'high' | 'medium' | 'low'
    visitEventId: string
    description: string
    recommendation: string
  }>
  riskScore: number // 0-100
  summary: string
}

export interface CollectionPriorityResult {
  prioritizedCustomers: Array<{
    customerId: string
    customerName: string
    balanceMinor: number
    daysPastDue: number
    priority: 1 | 2 | 3 | 4 | 5
    reason: string
    suggestedAction: string
  }>
  totalOutstanding: number
  summary: string
}

export interface SalesInsightResult {
  insights: Array<{
    type: 'trend' | 'opportunity' | 'warning' | 'recommendation'
    title: string
    description: string
    data?: Record<string, unknown>
  }>
  metrics: {
    totalSales: number
    averageOrderValue: number
    visitConversionRate: number
    comparisonPeriod?: string
    change?: number
  }
}

// Zod schemas for validation
export const RouteOptimizationInputSchema = z.object({
  routeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  considerTraffic: z.boolean().optional().default(true),
  prioritizeHighValue: z.boolean().optional().default(false),
})

export const FraudDetectionInputSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  userId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
})

export const CollectionPriorityInputSchema = z.object({
  minBalanceMinor: z.number().int().min(0).optional(),
  maxResults: z.number().int().min(1).max(100).optional().default(20),
  branchId: z.string().uuid().optional(),
})

export const SalesInsightInputSchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']),
  branchId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
})

export type RouteOptimizationInput = z.infer<typeof RouteOptimizationInputSchema>
export type FraudDetectionInput = z.infer<typeof FraudDetectionInputSchema>
export type CollectionPriorityInput = z.infer<typeof CollectionPriorityInputSchema>
export type SalesInsightInput = z.infer<typeof SalesInsightInputSchema>
