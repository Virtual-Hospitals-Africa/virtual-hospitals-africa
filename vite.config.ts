import { defineConfig } from 'vite'
import { fresh } from '@fresh/plugin-vite'
import tailwindcss from '@tailwindcss/vite'
import { positive_integer } from './util/validators.ts'

let port = 8001
const PORT = Deno.env.get('PORT')
if (PORT) {
  port = positive_integer.parse(PORT)
}

export default defineConfig({
  plugins: [
    fresh(),
    tailwindcss(),
  ],
  server: {
    port,
    // https: Object.keys(httpsOpts).length > 0 ? httpsOpts : undefined,
  },
})
