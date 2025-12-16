import { defineConfig, PluginOption } from 'vite'
import { fresh } from '@fresh/plugin-vite'
import tailwindcss from '@tailwindcss/vite'

const PORT = Deno.env.get('PORT') || '8001'

export default defineConfig({
  plugins: [
    fresh() as PluginOption,
    tailwindcss() as PluginOption,
  ],
  server: {
    port: parseInt(PORT, 10),
  },
  clearScreen: false,
})
