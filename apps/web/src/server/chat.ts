/**
 * AI Chat API Handler
 *
 * Provides chat interface for AI assistant functionality
 * - Customer service chat
 * - Sales assistant
 * - Admin support
 */
import type { AppServerContext } from './env'
import { jsonResponse } from './http'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface ChatRequest {
  message: string
  conversationId?: string
  context?: {
    customerId?: string
    invoiceId?: string
    routeId?: string
  }
}

export interface ChatResponse {
  ok: boolean
  message?: ChatMessage
  conversationId?: string
  error?: string
}

// Demo responses for different intents
const DEMO_RESPONSES: Record<string, string> = {
  greeting: 'Halo! Saya asisten AI untuk membantu Anda. Ada yang bisa saya bantu hari ini?',
  customer:
    'Untuk informasi pelanggan, saya bisa membantu Anda mencari data pelanggan, melihat riwayat kunjungan, atau status piutang. Silakan berikan nama pelanggan yang ingin dicari.',
  invoice:
    'Saya bisa membantu dengan invoice. Untuk melihat detail invoice, cari invoice berdasarkan nomor, atau membuat invoice baru.',
  payment:
    'Untuk pembayaran, saya bisa membantu mencatat pembayaran, melihat riwayat pembayaran, atau mengecek status pelunasan invoice.',
  route: 'Untuk rute kunjungan, saya bisa menampilkan rute hari ini, mengecek status kunjungan, atau membantu planning rute baru.',
  report:
    'Laporan yang tersedia: Aging Report (piutang), Visit Report (kunjungan), Sales Report (penjualan). Laporan mana yang ingin Anda lihat?',
  default:
    'Maaf, saya tidak yakin dengan maksud Anda. Saya bisa membantu dengan: pelanggan, invoice, pembayaran, rute kunjungan, atau laporan. Silakan pilih topik yang diinginkan.',
}

function detectIntent(message: string): string {
  const lowercased = message.toLowerCase()

  if (lowercased.match(/^(halo|hai|hi|hello|selamat)/)) {
    return 'greeting'
  }
  if (lowercased.match(/(pelanggan|customer|toko|warung)/)) {
    return 'customer'
  }
  if (lowercased.match(/(invoice|faktur|tagihan)/)) {
    return 'invoice'
  }
  if (lowercased.match(/(bayar|pembayaran|payment|lunasi)/)) {
    return 'payment'
  }
  if (lowercased.match(/(rute|route|kunjungan|visit)/)) {
    return 'route'
  }
  if (lowercased.match(/(laporan|report|aging|piutang)/)) {
    return 'report'
  }

  return 'default'
}

function generateResponse(message: string, context?: ChatRequest['context']): string {
  const intent = detectIntent(message)
  let response = DEMO_RESPONSES[intent]

  // Add context-specific information if available
  if (context?.customerId && intent === 'customer') {
    response += `\n\nSaya melihat Anda sedang melihat pelanggan ${context.customerId}. Butuh informasi spesifik?`
  }

  if (context?.invoiceId && intent === 'invoice') {
    response += `\n\nInvoice ${context.invoiceId} sedang dibuka. Ada yang perlu dibantu terkait invoice ini?`
  }

  return response
}

export async function handleChatApiRequest(
  request: Request,
  context: AppServerContext,
  subPath: string,
): Promise<Response> {
  const method = request.method.toUpperCase()

  // POST /api/t/:tenant/chat - Send message
  if (method === 'POST' && (subPath === '' || subPath === '/')) {
    return handleSendMessage(request, context)
  }

  // GET /api/t/:tenant/chat/history/:conversationId - Get conversation history
  if (method === 'GET' && subPath.startsWith('/history/')) {
    const conversationId = subPath.replace('/history/', '')
    return handleGetHistory(request, context, conversationId)
  }

  // DELETE /api/t/:tenant/chat/:conversationId - Clear conversation
  if (method === 'DELETE' && subPath.startsWith('/')) {
    const conversationId = subPath.slice(1)
    return handleClearConversation(request, context, conversationId)
  }

  return jsonResponse(request, context.env, { ok: false, error: 'Not found' }, { status: 404 })
}

async function handleSendMessage(request: Request, context: AppServerContext): Promise<Response> {
  try {
    const body = (await request.json()) as ChatRequest

    if (!body.message?.trim()) {
      return jsonResponse(request, context.env, { ok: false, error: 'Message is required' }, { status: 400 })
    }

    // Generate conversation ID if not provided
    const conversationId = body.conversationId || `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Generate response
    const responseText = generateResponse(body.message, body.context)

    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
    }

    // TODO: In production, integrate with OpenAI agent from packages/agents
    // const agent = new OpenAIAgent({
    //   apiKey: context.env.OPENAI_API_KEY,
    //   model: 'gpt-4o-mini',
    // })
    // const response = await agent.chat(body.message, {
    //   userRole: context.session?.role,
    //   tenant: context.session?.tenant,
    // })

    return jsonResponse(request, context.env, {
      ok: true,
      message: assistantMessage,
      conversationId,
    } as ChatResponse)
  } catch (error) {
    console.error('Chat error:', error)
    return jsonResponse(
      request,
      context.env,
      { ok: false, error: 'Failed to process message' },
      { status: 500 },
    )
  }
}

async function handleGetHistory(
  request: Request,
  context: AppServerContext,
  conversationId: string,
): Promise<Response> {
  // TODO: Fetch from database
  // For demo, return empty history
  return jsonResponse(request, context.env, {
    ok: true,
    conversationId,
    messages: [] as ChatMessage[],
  })
}

async function handleClearConversation(
  request: Request,
  context: AppServerContext,
  conversationId: string,
): Promise<Response> {
  // TODO: Delete from database
  return jsonResponse(request, context.env, {
    ok: true,
    conversationId,
    message: 'Conversation cleared',
  })
}
