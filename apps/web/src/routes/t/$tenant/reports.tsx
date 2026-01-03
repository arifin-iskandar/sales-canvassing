/**
 * Reports page - placeholder
 */
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent } from '@canvassing/ui'
import { BarChart3, FileDown, AlertTriangle, Calendar } from 'lucide-react'
import { Button } from '@canvassing/ui'

export const Route = createFileRoute('/t/$tenant/reports')({
  component: ReportsPage,
})

function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
        <p className="text-gray-600">Analisis dan export data</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Laporan Aging
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Lihat analisis piutang berdasarkan umur tagihan.
            </p>
            <Button variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Laporan Kunjungan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Lihat ringkasan aktivitas kunjungan sales.
            </p>
            <Button variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Exceptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Kunjungan dengan lokasi tidak valid atau di luar geofence.
            </p>
            <Button variant="outline">Lihat Detail</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
