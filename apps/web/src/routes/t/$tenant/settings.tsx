/**
 * Settings page - placeholder
 */
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent } from '@canvassing/ui'
import { Settings, Users, Building2, Package } from 'lucide-react'

export const Route = createFileRoute('/t/$tenant/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-600">Kelola konfigurasi perusahaan</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Kelola akses dan role pengguna (owner, admin, supervisor, sales).
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              Cabang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Kelola lokasi cabang dan wilayah penjualan.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Produk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Kelola katalog produk untuk invoice (opsional).
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Umum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Pengaturan anti-fraud, geofence, dan preferensi lainnya.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
