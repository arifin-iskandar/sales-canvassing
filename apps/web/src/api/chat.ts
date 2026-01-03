/**
 * Chat API hooks for AI assistant
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from './client'
import type { ChatMessage, ChatRequest, ChatResponse } from '../server/chat'

export { type ChatMessage, type ChatRequest, type ChatResponse }

/**
 * Send a chat message
 */
export function useSendChatMessage(tenant: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: ChatRequest) => {
      return apiRequest<ChatResponse, ChatRequest>(`/api/t/${tenant}/chat`, {
        method: 'POST',
        body: request,
      })
    },
    onSuccess: (data) => {
      // Invalidate chat history if we have a conversation
      if (data.conversationId) {
        queryClient.invalidateQueries({
          queryKey: ['chat', tenant, data.conversationId],
        })
      }
    },
  })
}

/**
 * Get chat history for a conversation
 */
export function useChatHistory(tenant: string, conversationId: string | null) {
  return useQuery({
    queryKey: ['chat', tenant, conversationId],
    queryFn: async () => {
      if (!conversationId) return { ok: true, messages: [] }
      return apiRequest<{ ok: boolean; messages: ChatMessage[] }>(
        `/api/t/${tenant}/chat/history/${conversationId}`,
      )
    },
    enabled: !!conversationId,
  })
}

/**
 * Clear a chat conversation
 */
export function useClearChat(tenant: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (conversationId: string) => {
      return apiRequest<{ ok: boolean }>(`/api/t/${tenant}/chat/${conversationId}`, {
        method: 'DELETE',
      })
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: ['chat', tenant, conversationId],
      })
    },
  })
}
