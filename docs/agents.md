# AI Agent SDK Documentation

The `@canvassing/agents` package provides AI agent capabilities for the Sales Canvassing system.

## Overview

The Agent SDK enables:
- **Route Optimization**: Suggest optimal visit sequences
- **Fraud Detection**: Identify suspicious visit patterns
- **Collection Priority**: Prioritize collection efforts
- **Sales Insights**: Analyze sales performance
- **General Assistant**: Answer user questions

## Installation

The agents package is included in the monorepo:

```bash
pnpm install
```

## Quick Start

```typescript
import { createOpenAIAgent, getToolsForRole } from '@canvassing/agents'

// Create agent with OpenAI
const agent = createOpenAIAgent(process.env.OPENAI_API_KEY!)

// Register tools based on user role
for (const tool of getToolsForRole('supervisor')) {
  agent.registerTool(tool)
}

// Add capabilities
agent.addCapability('fraud_detection')
agent.addCapability('collection_priority')

// Define context
const context = {
  tenantId: 'tenant-123',
  userId: 'user-456',
  userRole: 'supervisor' as const,
  locale: 'id-ID',
}

// Run agent
const result = await agent.run('Analyze visit data for fraud this week', context)
console.log(result.response)
```

## Agent Types

### OpenAI Agent

Uses OpenAI's GPT models (gpt-4o, gpt-4o-mini, etc.):

```typescript
import { createOpenAIAgent } from '@canvassing/agents'

const agent = createOpenAIAgent(apiKey, {
  model: 'gpt-4o',           // Default: gpt-4o-mini
  maxTokens: 4096,           // Default: 2048
  temperature: 0.5,          // Default: 0.7
})
```

### Custom Agent

Extend `BaseAgent` for custom providers:

```typescript
import { BaseAgent, AgentContext, AgentMessage, AgentResponse } from '@canvassing/agents'

class MyAgent extends BaseAgent {
  async chat(messages: AgentMessage[], context: AgentContext): Promise<AgentResponse> {
    // Your implementation
  }

  async *chatStream(messages: AgentMessage[], context: AgentContext) {
    // Your streaming implementation
  }
}
```

## Capabilities

Add capabilities to customize the agent's system prompt:

| Capability | Description |
|------------|-------------|
| `route_optimization` | Optimize sales routes for efficiency |
| `fraud_detection` | Detect suspicious visit patterns |
| `collection_priority` | Prioritize collection efforts |
| `sales_insights` | Analyze sales performance |
| `customer_analysis` | Analyze customer behavior |
| `general_assistant` | General help and navigation |

```typescript
agent.addCapability('fraud_detection')
agent.addCapability('sales_insights')
```

## Built-in Tools

### Available Tools

| Tool | Description | Roles |
|------|-------------|-------|
| `get_customer` | Get customer details | All |
| `search_customers` | Search customers | All |
| `get_route` | Get route details | All |
| `get_visit_history` | Get visit history | Sales+, Collector+ |
| `get_invoice` | Get invoice details | Sales+ |
| `get_aging_report` | Get aging report | Supervisor+, Collector |
| `get_sales_summary` | Get sales statistics | Supervisor+, Sales |
| `get_collection_summary` | Get collection stats | Supervisor+, Collector |
| `analyze_fraud` | Fraud analysis | Supervisor+ |

### Role-based Tool Access

```typescript
import { getToolsForRole } from '@canvassing/agents'

// Get tools for a specific role
const salesTools = getToolsForRole('sales')
const supervisorTools = getToolsForRole('supervisor')
const adminTools = getToolsForRole('admin')  // Gets all tools
```

### Custom Tools

Create custom tools using the `createTool` helper:

```typescript
import { createTool } from '@canvassing/agents'
import { z } from 'zod'

const myTool = createTool(
  'my_custom_tool',
  'Description of what this tool does',
  z.object({
    param1: z.string(),
    param2: z.number().optional(),
  }),
  async (params, context) => {
    // Tool implementation
    return { result: 'data' }
  }
)

agent.registerTool(myTool)
```

## Streaming Responses

For real-time responses:

```typescript
const messages = [{ role: 'user', content: 'What are my pending collections?' }]

for await (const chunk of agent.chatStream(messages, context)) {
  if (chunk.type === 'text') {
    process.stdout.write(chunk.content!)
  }
}
```

## Integration with Web App

### API Endpoint

Add an agent endpoint to your web app:

```typescript
// apps/web/src/server/agent.ts
import { createOpenAIAgent, getToolsForRole } from '@canvassing/agents'

export async function handleAgentRequest(
  request: Request,
  context: AppServerContext,
): Promise<Response> {
  if (!context.session) {
    return jsonResponse(request, context.env, { error: 'Unauthorized' }, { status: 401 })
  }

  const { message } = await request.json()

  const agent = createOpenAIAgent(context.env.OPENAI_API_KEY)

  // Register tools based on user role
  for (const tool of getToolsForRole(context.session.role)) {
    agent.registerTool(tool)
  }

  // Add relevant capabilities
  agent.addCapability('general_assistant')
  if (['owner', 'admin', 'supervisor'].includes(context.session.role)) {
    agent.addCapability('fraud_detection')
    agent.addCapability('sales_insights')
  }

  const agentContext = {
    tenantId: context.session.tenant,
    userId: context.session.sub,
    userRole: context.session.role,
    locale: 'id-ID',
  }

  const result = await agent.run(message, agentContext)

  return jsonResponse(request, context.env, { response: result.response })
}
```

### Environment Variables

Add to your `.env` or Cloudflare secrets:

```bash
OPENAI_API_KEY=sk-...
```

For Cloudflare Workers:

```bash
wrangler secret put OPENAI_API_KEY --env staging
```

## Security Considerations

1. **API Key Protection**: Store API keys as secrets, never in code
2. **Role-based Access**: Tools are filtered by user role automatically
3. **Tenant Isolation**: Always pass tenantId in context
4. **Input Validation**: All tool parameters are validated with Zod

## Error Handling

```typescript
try {
  const result = await agent.run(message, context)
  return result.response
} catch (error) {
  if (error instanceof RateLimitError) {
    // Handle rate limiting
  }
  if (error instanceof PermissionError) {
    // Handle permission denied
  }
  // Handle other errors
}
```

## Extending the SDK

### Adding New Analysis Types

1. Define types in `types.ts`:

```typescript
export interface MyAnalysisResult {
  data: Array<{...}>
  summary: string
}
```

2. Create input schema:

```typescript
export const MyAnalysisInputSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
})
```

3. Create tool in `tools.ts`:

```typescript
export const myAnalysisTool = createTool(
  'my_analysis',
  'Perform custom analysis',
  MyAnalysisInputSchema,
  async (params, context) => {
    // Implementation
  }
)
```

4. Add to exports in `index.ts`

## Testing

```typescript
import { describe, it, expect, vi } from 'vitest'
import { createOpenAIAgent } from '@canvassing/agents'

describe('Agent', () => {
  it('should respond to messages', async () => {
    const agent = createOpenAIAgent('test-key')
    // Mock OpenAI client
    vi.spyOn(agent['client'].chat.completions, 'create')
      .mockResolvedValue({...})

    const context = {
      tenantId: 'test-tenant',
      userId: 'test-user',
      userRole: 'admin' as const,
      locale: 'id-ID',
    }

    const result = await agent.run('Hello', context)
    expect(result.response).toBeDefined()
  })
})
```
