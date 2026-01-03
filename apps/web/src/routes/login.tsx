/**
 * Login page
 */
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { apiRequest, ApiError } from '@/api/client'
import { useSession } from '@/lib/sessionContext'
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@canvassing/ui'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

type LoginForm = z.infer<typeof loginSchema>

type LoginResponse = {
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

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/login' }) as { redirect?: string }
  const { setSession } = useSession()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      return apiRequest<LoginResponse>('/api/auth/login', {
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

      const redirectTo = search.redirect || `/t/${data.tenant.slug}/dashboard`
      navigate({ to: redirectTo })
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.')
      }
    },
  })

  const onSubmit = (data: LoginForm) => {
    setError(null)
    loginMutation.mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sales Canvassing</CardTitle>
          <CardDescription>Masuk ke akun Anda</CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Memproses...' : 'Masuk'}
            </Button>
            <p className="text-sm text-gray-600 text-center">
              Belum punya akun?{' '}
              <a href="/signup" className="text-blue-600 hover:underline">
                Daftar sekarang
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
