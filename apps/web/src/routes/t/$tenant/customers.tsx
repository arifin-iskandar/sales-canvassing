/**
 * Customers list page - placeholder
 */
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent } from '@canvassing/ui'
import { Users, Plus } from 'lucide-react'
import { Button } from '@canvassing/ui'

export const Route = createFileRoute('/t/$tenant/customers')({
  component: CustomersPage,
})

function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pelanggan</h1>
          <p className="text-gray-600">Kelola daftar pelanggan Anda</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pelanggan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar Pelanggan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            Belum ada pelanggan. Klik tombol "Tambah Pelanggan" untuk memulai.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
