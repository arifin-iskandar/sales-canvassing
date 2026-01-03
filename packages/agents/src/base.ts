/**
 * Base Agent Implementation
 *
 * Abstract base class for AI agents with common functionality
 */

import type {
  AgentConfig,
  AgentContext,
  AgentMessage,
  AgentResponse,
  AgentTool,
  AgentCapability,
} from './types'

export abstract class BaseAgent {
  protected config: AgentConfig
  protected tools: Map<string, AgentTool> = new Map()
  protected capabilities: Set<AgentCapability> = new Set()

  constructor(config: AgentConfig) {
    this.config = config
  }

  /**
   * Register a tool that the agent can use
   */
  registerTool(tool: AgentTool): void {
    this.tools.set(tool.name, tool)
  }

  /**
   * Add a capability to the agent
   */
  addCapability(capability: AgentCapability): void {
    this.capabilities.add(capability)
  }

  /**
   * Check if agent has a specific capability
   */
  hasCapability(capability: AgentCapability): boolean {
    return this.capabilities.has(capability)
  }

  /**
   * Get system prompt based on capabilities
   */
  protected getSystemPrompt(context: AgentContext): string {
    const basePrompt = `You are an AI assistant for a sales canvassing and collection tracking system in Indonesia.
You help sales teams, collectors, and supervisors manage their field operations.

Current user: ${context.userRole}
Tenant ID: ${context.tenantId}
Locale: ${context.locale}

Always respond in Indonesian (Bahasa Indonesia) unless the user writes in English.
Use Indonesian Rupiah (IDR) for all monetary values.
Format dates in Indonesian style (DD/MM/YYYY).
`

    const capabilityPrompts: Record<AgentCapability, string> = {
      route_optimization: `
You can help optimize sales routes to minimize travel time and distance.
Consider traffic patterns, customer priorities, and visit history.
`,
      fraud_detection: `
You can analyze visit data for potential fraud indicators:
- Visits outside customer geofence
- Rapid successive check-ins (spam)
- Low GPS accuracy
- Suspicious patterns
`,
      collection_priority: `
You can prioritize collection efforts based on:
- Outstanding balance amounts
- Days past due
- Payment history
- Customer risk profile
`,
      sales_insights: `
You can provide insights on sales performance:
- Trend analysis
- Conversion rates
- Top performing areas
- Growth opportunities
`,
      customer_analysis: `
You can analyze customer data:
- Purchase patterns
- Visit frequency
- Payment behavior
- Credit recommendations
`,
      general_assistant: `
You can answer general questions about the system and help users navigate features.
`,
    }

    let prompt = basePrompt
    for (const capability of this.capabilities) {
      prompt += capabilityPrompts[capability]
    }

    return prompt
  }

  /**
   * Execute a tool call
   */
  protected async executeTool(
    toolName: string,
    args: unknown,
    context: AgentContext,
  ): Promise<unknown> {
    const tool = this.tools.get(toolName)
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`)
    }

    // Validate arguments
    const parsed = tool.parameters.parse(args)

    // Execute tool
    return await tool.execute(parsed, context)
  }

  /**
   * Send a message and get a response (abstract)
   */
  abstract chat(
    messages: AgentMessage[],
    context: AgentContext,
  ): Promise<AgentResponse>

  /**
   * Send a message and stream the response (abstract)
   */
  abstract chatStream(
    messages: AgentMessage[],
    context: AgentContext,
  ): AsyncIterable<{ type: 'text' | 'done'; content?: string }>
}

/**
 * Tool builder helper
 */
export function createTool<T>(
  name: string,
  description: string,
  parameters: import('zod').ZodType<T>,
  execute: (params: T, context: AgentContext) => Promise<unknown>,
): AgentTool {
  return {
    name,
    description,
    parameters,
    execute: execute as (params: unknown, context: AgentContext) => Promise<unknown>,
  }
}
