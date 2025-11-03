import { defineConfig } from 'vite'
import { fresh } from '@fresh/plugin-vite'
import tailwindcss from '@tailwindcss/vite'

let port = 8001
const PORT = Deno.env.get('PORT')
if (PORT) {
  port = parseInt(PORT, 10)
}

export default defineConfig({
  plugins: [
    fresh(),
    tailwindcss(),
  ],
  server: {
    port,
  },
  clearScreen: false,
})
