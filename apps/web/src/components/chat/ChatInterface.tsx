/**
 * AI Chat Interface Component
 *
 * Reusable chat component for AI assistant
 */
import { useState, useRef, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import {
  PaperAirplaneIcon,
  SparklesIcon,
  UserCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { useSendChatMessage, type ChatMessage } from '../../api/chat'

interface ChatInterfaceProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  context?: {
    customerId?: string
    invoiceId?: string
    routeId?: string
  }
}

export function ChatInterface({ isOpen, onClose, title = 'AI Assistant', context }: ChatInterfaceProps) {
  const { tenant } = useParams({ strict: false }) as { tenant: string }
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sendMessage = useSendChatMessage(tenant)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Halo! Saya asisten AI untuk membantu Anda. Ada yang bisa saya bantu?',
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }, [isOpen, messages.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || sendMessage.isPending) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')

    try {
      const response = await sendMessage.mutateAsync({
        message: inputValue.trim(),
        conversationId: conversationId ?? undefined,
        context,
      })

      if (response.ok && response.message) {
        setMessages((prev) => [...prev, response.message!])
        if (response.conversationId) {
          setConversationId(response.conversationId)
        }
      }
    } catch (error) {
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Halo! Saya asisten AI untuk membantu Anda. Ada yang bisa saya bantu?',
        timestamp: new Date().toISOString(),
      },
    ])
    setConversationId(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-[500px] w-96 flex-col rounded-lg border bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 rounded-t-lg">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-white" />
          <span className="font-medium text-white">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="rounded p-1 text-white/80 hover:bg-white/20 hover:text-white"
            title="Clear chat"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="rounded p-1 text-white/80 hover:bg-white/20 hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className="flex-shrink-0">
              {message.role === 'user' ? (
                <UserCircleIcon className="h-8 w-8 text-slate-400" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                  <SparklesIcon className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {sendMessage.isPending && (
          <div className="flex gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <SparklesIcon className="h-4 w-4 text-white" />
            </div>
            <div className="rounded-lg bg-slate-100 px-3 py-2">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={sendMessage.isPending}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || sendMessage.isPending}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
