import { Handlers } from '$fresh/server.ts'
import redirect from '../util/redirect.ts'

export const handler: Handlers = {
  GET: () => redirect('/regulator/pharmacies'),
}
