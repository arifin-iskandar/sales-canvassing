/**
 * Landing page - redirects to login or dashboard
 */
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    // If authenticated, redirect to tenant dashboard
    // @ts-expect-error - context type
    const session = context?.serverContext?.session
    if (session?.tenant && session?.slug) {
      throw redirect({ to: `/t/${session.slug}/dashboard` })
    }
    // Otherwise, redirect to login
    throw redirect({ to: '/login' })
  },
  component: () => null,
})
