/**
 * Payments page - placeholder
 */
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent } from '@canvassing/ui'
import { CreditCard } from 'lucide-react'

export const Route = createFileRoute('/t/$tenant/payments')({
  component: PaymentsPage,
})

function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pembayaran</h1>
        <p className="text-gray-600">Riwayat penagihan dan pembayaran</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Daftar Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            Belum ada pembayaran tercatat. Pembayaran akan muncul setelah dicatat dari kunjungan lapangan.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
