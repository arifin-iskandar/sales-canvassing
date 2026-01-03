import { createRouter } from '@tanstack/react-router'

import type { AppRouterContext } from './types/app'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: {
      serverContext: undefined,
      tenant: undefined,
      sessionData: undefined,
    } satisfies AppRouterContext,
  })
}
