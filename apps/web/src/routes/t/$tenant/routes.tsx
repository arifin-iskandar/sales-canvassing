/**
 * Routes/PJP management page - placeholder
 */
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent } from '@canvassing/ui'
import { MapPin, Plus } from 'lucide-react'
import { Button } from '@canvassing/ui'

export const Route = createFileRoute('/t/$tenant/routes')({
  component: RoutesPage,
})

function RoutesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rute Kunjungan</h1>
          <p className="text-gray-600">Kelola jadwal kunjungan (PJP)</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Buat Rute Baru
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Rute Aktif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            Belum ada rute yang dibuat. Klik tombol "Buat Rute Baru" untuk
            memulai.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
