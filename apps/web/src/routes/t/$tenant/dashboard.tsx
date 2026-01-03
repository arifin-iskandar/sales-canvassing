/**
 * Dashboard page - overview of key metrics
 */
import { createFileRoute } from '@tanstack/react-router'
import { useTenantContext } from '@/lib/tenantContext'
import { Card, CardHeader, CardTitle, CardContent } from '@canvassing/ui'
import {
  Users,
  MapPin,
  FileText,
  CreditCard,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'

export const Route = createFileRoute('/t/$tenant/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { tenantName } = useTenantContext()

  // TODO: Fetch actual metrics from API
  const stats = [
    {
      title: 'Kunjungan Hari Ini',
      value: '0',
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pelanggan Aktif',
      value: '0',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Invoice Tertunda',
      value: '0',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Penagihan Hari Ini',
      value: 'Rp 0',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Selamat datang di {tenantName}</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Rute Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Belum ada rute yang dijadwalkan untuk hari ini.
            </p>
            <a
              href="./routes"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Kelola rute &rarr;
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Piutang Jatuh Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Tidak ada piutang yang jatuh tempo.
            </p>
            <a
              href="./reports"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Lihat laporan aging &rarr;
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
