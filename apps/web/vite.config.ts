import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const isVitest = process.env.VITEST === 'true'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tanstackStubModule = path.resolve(__dirname, 'src/test/tanstackStubs.ts')
const testAliases = isVitest
  ? {
      '@tanstack/react-start/server-entry': path.resolve(
        __dirname,
        'src/test/reactStartServerEntryStub.ts',
      ),
      '#tanstack-router-entry': tanstackStubModule,
      '#tanstack-start-entry': tanstackStubModule,
      'tanstack-start-manifest:v': tanstackStubModule,
      'tanstack-start-injected-head-scripts:v': tanstackStubModule,
    }
  : {}
const alias = {
  ...testAliases,
}

export default defineConfig({
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias,
  },
  optimizeDeps: {
    esbuildOptions: {
      alias,
    },
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    ...(isVitest ? [] : [tanstackStart({ customViteReactPlugin: true })]),
    viteReact(),
  ],
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
  },
})
