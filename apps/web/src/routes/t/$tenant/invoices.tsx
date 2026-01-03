/**
 * Invoices page - placeholder
 */
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent } from '@canvassing/ui'
import { FileText, Plus } from 'lucide-react'
import { Button } from '@canvassing/ui'

export const Route = createFileRoute('/t/$tenant/invoices')({
  component: InvoicesPage,
})

function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
          <p className="text-gray-600">Kelola invoice pelanggan</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Buat Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Daftar Invoice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            Belum ada invoice. Invoice akan muncul setelah dibuat dari kunjungan lapangan.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
