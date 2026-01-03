/**
 * Signup page
 */
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { apiRequest, ApiError } from '@/api/client'
import { useSession } from '@/lib/sessionContext'
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@canvassing/ui'

const signupSchema = z.object({
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  tenantName: z.string().min(2, 'Nama perusahaan minimal 2 karakter'),
})

type SignupForm = z.infer<typeof signupSchema>

type SignupResponse = {
  ok: boolean
  user: {
    id: string
    email: string
    fullName: string
    role: string
  }
  tenant: {
    id: string
    slug: string
    name: string
  }
}

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const { setSession } = useSession()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      tenantName: '',
    },
  })

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      return apiRequest<SignupResponse>('/api/auth/signup', {
        method: 'POST',
        body: data,
      })
    },
    onSuccess: (data) => {
      setSession(
        {
          id: data.user.id,
          email: data.user.email,
          name: data.user.fullName,
          role: data.user.role as 'owner' | 'admin' | 'supervisor' | 'sales' | 'collector',
        },
        {
          id: data.tenant.id,
          slug: data.tenant.slug,
          name: data.tenant.name,
        },
      )

      navigate({ to: `/t/${data.tenant.slug}/dashboard` })
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.')
      }
    },
  })

  const onSubmit = (data: SignupForm) => {
    setError(null)
    signupMutation.mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
          <CardDescription>
            Mulai kelola penjualan dan penagihan Anda
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                {...form.register('fullName')}
              />
              {form.formState.errors.fullName && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@perusahaan.com"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenantName">Nama Perusahaan</Label>
              <Input
                id="tenantName"
                type="text"
                placeholder="PT Distributor Jaya"
                {...form.register('tenantName')}
              />
              {form.formState.errors.tenantName && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.tenantName.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? 'Memproses...' : 'Daftar'}
            </Button>
            <p className="text-sm text-gray-600 text-center">
              Sudah punya akun?{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                Masuk
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
