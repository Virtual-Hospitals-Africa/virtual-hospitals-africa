import { defineConfig } from 'vite'
import { fresh } from '@fresh/plugin-vite'
import tailwindcss from '@tailwindcss/vite'
import { promiseProps } from './util/promiseProps.ts'

const { SERVE_PLAIN_HTTP, PORT } = Deno.env.toObject()
const httpsOpts: {
  key?: string
  cert?: string
} = SERVE_PLAIN_HTTP ? {} : await promiseProps({
  key: Deno.readTextFile('./local-certs/localhost.key'),
  cert: Deno.readTextFile('./local-certs/localhost.crt'),
})

export default defineConfig({
  plugins: [
    fresh(),
    tailwindcss(),
  ],
  server: {
    port: PORT ? parseInt(PORT, 10) : 8000,
    https: Object.keys(httpsOpts).length > 0 ? httpsOpts : undefined,
  },
})
