/**
 * Floating Chat Button Component
 *
 * Shows a floating button to open the AI chat interface
 */
import { useState } from 'react'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid'
import { ChatInterface } from './ChatInterface'

interface ChatButtonProps {
  context?: {
    customerId?: string
    invoiceId?: string
    routeId?: string
  }
}

export function ChatButton({ context }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105"
          aria-label="Open AI Assistant"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
      )}

      {/* Chat Interface */}
      <ChatInterface
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        context={context}
      />
    </>
  )
}
