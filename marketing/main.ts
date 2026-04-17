import { App, staticFiles } from 'fresh'

export const app = new App()
  .use(staticFiles())
  .fsRoutes()

globalThis.addEventListener('unhandledrejection', (e) => {
  console.error('Caught unhandled rejection:', e.reason)
  e.preventDefault()
})
