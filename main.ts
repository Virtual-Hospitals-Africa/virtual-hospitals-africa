import { App, staticFiles } from 'fresh'
import httpsUrlPlugin from './plugins/httpsUrl.ts'

export const app = new App()
  // Add HTTPS URL middleware
  .use(httpsUrlPlugin().middlewares[0].middleware.handler)
  // Add static file serving middleware
  .use(staticFiles())
  // Enable file-system based routing
  .fsRoutes()
