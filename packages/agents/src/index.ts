/**
 * @canvassing/agents - AI Agent SDK for Sales Canvassing
 *
 * This package provides AI agent capabilities for the Sales Canvassing system:
 * - Route optimization
 * - Fraud detection
 * - Collection prioritization
 * - Sales insights
 * - General assistant
 *
 * @example
 * ```typescript
 * import { createOpenAIAgent, getToolsForRole } from '@canvassing/agents'
 *
 * const agent = createOpenAIAgent(process.env.OPENAI_API_KEY!)
 *
 * // Register tools based on user role
 * for (const tool of getToolsForRole('supervisor')) {
 *   agent.registerTool(tool)
 * }
 *
 * // Add capabilities
 * agent.addCapability('fraud_detection')
 * agent.addCapability('collection_priority')
 *
 * // Run agent
 * const context = {
 *   tenantId: 'tenant-123',
 *   userId: 'user-456',
 *   userRole: 'supervisor' as const,
 *   locale: 'id-ID',
 * }
 *
 * const result = await agent.run('Analyze visit data for fraud', context)
 * console.log(result.response)
 * ```
 */

// Types
export type {
  AgentProvider,
  AgentConfig,
  AgentContext,
  AgentCapability,
  AgentTool,
  AgentMessage,
  AgentResponse,
  AgentStreamChunk,
  ToolCall,
  RouteOptimizationResult,
  FraudDetectionResult,
  CollectionPriorityResult,
  SalesInsightResult,
  RouteOptimizationInput,
  FraudDetectionInput,
  CollectionPriorityInput,
  SalesInsightInput,
} from './types'

// Schemas
export {
  RouteOptimizationInputSchema,
  FraudDetectionInputSchema,
  CollectionPriorityInputSchema,
  SalesInsightInputSchema,
} from './types'

// Base classes
export { BaseAgent, createTool } from './base'

// OpenAI implementation
export { OpenAIAgent, createOpenAIAgent } from './openai'

// Tools
export {
  getCustomerTool,
  searchCustomersTool,
  getAgingReportTool,
  getVisitHistoryTool,
  getRouteTool,
  getInvoiceTool,
  getSalesSummaryTool,
  getCollectionSummaryTool,
  analyzeFraudTool,
  getAllTools,
  getToolsForRole,
} from './tools'
