import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  output: 'static',
  integrations: [tailwind(), react()],
  // Use cloudflare adapter for server mode if needed
  // adapter: cloudflare(),
})
