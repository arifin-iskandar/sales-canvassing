/**
 * Customer Support Admin Page
 *
 * Features:
 * - Support ticket management
 * - Customer service chat
 * - AI-assisted responses
 */
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ChatBubbleLeftEllipsisIcon,
  ClockIcon,
  ExclamationCircleIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

export const Route = createFileRoute('/t/$tenant/admin/support')({
  component: SupportAdminPage,
})

// Demo tickets
const DEMO_TICKETS = [
  {
    id: 'TKT-001',
    customer: 'Toko Maju Jaya',
    subject: 'Tidak bisa check-in di lokasi',
    status: 'open',
    priority: 'high',
    createdAt: '2024-01-20 09:30',
    lastReply: '2024-01-20 10:15',
    messages: [
      { role: 'customer', content: 'Selamat pagi, saya tidak bisa check-in di lokasi pelanggan. GPS tidak terdeteksi.', time: '09:30' },
      { role: 'support', content: 'Terima kasih sudah menghubungi kami. Apakah GPS di HP sudah diaktifkan? Coba cek di pengaturan.', time: '09:45' },
      { role: 'customer', content: 'Sudah saya aktifkan tapi masih tidak bisa.', time: '10:15' },
    ],
  },
  {
    id: 'TKT-002',
    customer: 'Warung Berkah',
    subject: 'Cara melihat laporan aging',
    status: 'pending',
    priority: 'medium',
    createdAt: '2024-01-19 14:00',
    lastReply: '2024-01-19 14:30',
    messages: [
      { role: 'customer', content: 'Bagaimana cara melihat laporan aging di aplikasi?', time: '14:00' },
      { role: 'support', content: 'Untuk melihat laporan aging, silakan buka menu Reports > Aging Report.', time: '14:30' },
    ],
  },
  {
    id: 'TKT-003',
    customer: 'Minimarket Sinar',
    subject: 'Request fitur export PDF',
    status: 'closed',
    priority: 'low',
    createdAt: '2024-01-18 11:00',
    lastReply: '2024-01-18 16:00',
    messages: [],
  },
]

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-green-100 text-green-700',
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-600',
  medium: 'text-yellow-600',
  low: 'text-slate-400',
}

function SupportAdminPage() {
  const [selectedTicket, setSelectedTicket] = useState<typeof DEMO_TICKETS[0] | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const handleGenerateAIResponse = async () => {
    setIsGeneratingAI(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setReplyMessage(
      'Terima kasih atas pertanyaannya. Untuk masalah GPS tidak terdeteksi, silakan coba langkah berikut:\n\n1. Pastikan GPS sudah diaktifkan di Settings > Location\n2. Berikan izin lokasi untuk aplikasi\n3. Coba restart aplikasi\n4. Jika masih bermasalah, coba restart HP\n\nApakah ada yang bisa kami bantu lagi?'
    )
    setIsGeneratingAI(false)
  }

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      {/* Ticket List */}
      <div className="w-96 flex-shrink-0 overflow-auto rounded-lg border bg-white">
        <div className="sticky top-0 border-b bg-white p-4">
          <h2 className="font-semibold text-slate-900">Support Tickets</h2>
          <div className="mt-2 flex gap-2">
            <button className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              Open (1)
            </button>
            <button className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
              Pending (1)
            </button>
            <button className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              All
            </button>
          </div>
        </div>
        <div className="divide-y">
          {DEMO_TICKETS.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`w-full p-4 text-left transition-colors hover:bg-slate-50 ${
                selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{ticket.customer}</span>
                    <ExclamationCircleIcon className={`h-4 w-4 ${PRIORITY_COLORS[ticket.priority]}`} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-1">{ticket.subject}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[ticket.status]}`}>
                  {ticket.status}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <ClockIcon className="h-3 w-3" />
                {ticket.lastReply}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Detail / Chat */}
      <div className="flex flex-1 flex-col rounded-lg border bg-white">
        {selectedTicket ? (
          <>
            {/* Header */}
            <div className="border-b p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{selectedTicket.subject}</h3>
                  <p className="text-sm text-slate-500">
                    {selectedTicket.customer} • {selectedTicket.id}
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedTicket.status}
                    className="rounded-md border-slate-300 text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {selectedTicket.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.role === 'support' ? 'flex-row-reverse' : ''}`}
                >
                  <div className="flex-shrink-0">
                    {msg.role === 'customer' ? (
                      <UserCircleIcon className="h-8 w-8 text-slate-400" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <ChatBubbleLeftEllipsisIcon className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div
                    className={`max-w-md rounded-lg p-3 ${
                      msg.role === 'support'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`mt-1 text-xs ${msg.role === 'support' ? 'text-blue-100' : 'text-slate-400'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply */}
            <div className="border-t p-4">
              <div className="mb-2 flex justify-end">
                <button
                  onClick={handleGenerateAIResponse}
                  disabled={isGeneratingAI}
                  className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 hover:bg-purple-200 disabled:opacity-50"
                >
                  <SparklesIcon className="h-4 w-4" />
                  {isGeneratingAI ? 'Generating...' : 'Generate AI Response'}
                </button>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="flex-1 rounded-md border-slate-300 text-sm"
                />
                <button className="flex-shrink-0 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-400">
            <div className="text-center">
              <ChatBubbleLeftEllipsisIcon className="mx-auto h-12 w-12" />
              <p className="mt-2">Select a ticket to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
