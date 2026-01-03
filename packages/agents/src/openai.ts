/**
 * OpenAI Agent Implementation
 *
 * Uses OpenAI's API for AI agent functionality
 */

import OpenAI from 'openai'
import type {
  AgentConfig,
  AgentContext,
  AgentMessage,
  AgentResponse,
  ToolCall,
} from './types'
import { BaseAgent } from './base'

export class OpenAIAgent extends BaseAgent {
  private client: OpenAI

  constructor(config: AgentConfig) {
    super(config)
    this.client = new OpenAI({
      apiKey: config.apiKey,
    })
  }

  /**
   * Convert internal messages to OpenAI format
   */
  private toOpenAIMessages(
    messages: AgentMessage[],
    context: AgentContext,
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const systemMessage: OpenAI.Chat.Completions.ChatCompletionSystemMessageParam = {
      role: 'system',
      content: this.getSystemPrompt(context),
    }

    const converted = messages.map((msg): OpenAI.Chat.Completions.ChatCompletionMessageParam => {
      if (msg.role === 'system') {
        return { role: 'system', content: msg.content }
      }
      if (msg.role === 'user') {
        return { role: 'user', content: msg.content }
      }
      if (msg.role === 'assistant') {
        if (msg.toolCalls && msg.toolCalls.length > 0) {
          return {
            role: 'assistant',
            content: msg.content || null,
            tool_calls: msg.toolCalls.map((tc) => ({
              id: tc.id,
              type: 'function' as const,
              function: {
                name: tc.name,
                arguments: tc.arguments,
              },
            })),
          }
        }
        return { role: 'assistant', content: msg.content }
      }
      if (msg.role === 'tool') {
        return {
          role: 'tool',
          content: msg.content,
          tool_call_id: msg.toolCallId!,
        }
      }
      throw new Error(`Unknown message role: ${msg.role}`)
    })

    return [systemMessage, ...converted]
  }

  /**
   * Convert registered tools to OpenAI format
   */
  private getOpenAITools(): OpenAI.Chat.Completions.ChatCompletionTool[] | undefined {
    if (this.tools.size === 0) return undefined

    return Array.from(this.tools.values()).map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: this.zodToJsonSchema(tool.parameters),
      },
    }))
  }

  /**
   * Simple Zod to JSON Schema converter
   * For production, use a proper library like zod-to-json-schema
   */
  private zodToJsonSchema(schema: import('zod').ZodType<unknown>): Record<string, unknown> {
    // This is a simplified implementation
    // In production, use zod-to-json-schema package
    const description = schema.description || ''
    return {
      type: 'object',
      description,
      properties: {},
      required: [],
    }
  }

  /**
   * Send a message and get a response
   */
  async chat(messages: AgentMessage[], context: AgentContext): Promise<AgentResponse> {
    const openaiMessages = this.toOpenAIMessages(messages, context)
    const tools = this.getOpenAITools()

    const response = await this.client.chat.completions.create({
      model: this.config.model || 'gpt-4o-mini',
      messages: openaiMessages,
      tools,
      max_tokens: this.config.maxTokens || 2048,
      temperature: this.config.temperature || 0.7,
    })

    const choice = response.choices[0]
    const message = choice.message

    let toolCalls: ToolCall[] | undefined
    if (message.tool_calls && message.tool_calls.length > 0) {
      toolCalls = message.tool_calls.map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: tc.function.arguments,
      }))
    }

    return {
      content: message.content || '',
      toolCalls,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    }
  }

  /**
   * Send a message and stream the response
   */
  async *chatStream(
    messages: AgentMessage[],
    context: AgentContext,
  ): AsyncIterable<{ type: 'text' | 'done'; content?: string }> {
    const openaiMessages = this.toOpenAIMessages(messages, context)

    const stream = await this.client.chat.completions.create({
      model: this.config.model || 'gpt-4o-mini',
      messages: openaiMessages,
      max_tokens: this.config.maxTokens || 2048,
      temperature: this.config.temperature || 0.7,
      stream: true,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta
      if (delta?.content) {
        yield { type: 'text', content: delta.content }
      }
    }

    yield { type: 'done' }
  }

  /**
   * Run agent with automatic tool execution
   */
  async run(
    userMessage: string,
    context: AgentContext,
    conversationHistory: AgentMessage[] = [],
  ): Promise<{ response: string; history: AgentMessage[] }> {
    const messages: AgentMessage[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ]

    let response = await this.chat(messages, context)
    messages.push({
      role: 'assistant',
      content: response.content,
      toolCalls: response.toolCalls,
    })

    // Handle tool calls
    while (response.toolCalls && response.toolCalls.length > 0) {
      for (const toolCall of response.toolCalls) {
        try {
          const args = JSON.parse(toolCall.arguments)
          const result = await this.executeTool(toolCall.name, args, context)

          messages.push({
            role: 'tool',
            content: JSON.stringify(result),
            toolCallId: toolCall.id,
          })
        } catch (error) {
          messages.push({
            role: 'tool',
            content: JSON.stringify({ error: String(error) }),
            toolCallId: toolCall.id,
          })
        }
      }

      // Get next response after tool execution
      response = await this.chat(messages, context)
      messages.push({
        role: 'assistant',
        content: response.content,
        toolCalls: response.toolCalls,
      })
    }

    return {
      response: response.content,
      history: messages,
    }
  }
}

/**
 * Create an OpenAI agent with default configuration
 */
export function createOpenAIAgent(apiKey: string, options?: Partial<AgentConfig>): OpenAIAgent {
  return new OpenAIAgent({
    provider: 'openai',
    apiKey,
    model: options?.model || 'gpt-4o-mini',
    maxTokens: options?.maxTokens || 2048,
    temperature: options?.temperature || 0.7,
  })
}
