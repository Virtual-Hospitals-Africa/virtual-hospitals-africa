import { RouteHandler } from 'fresh'
import redirect from '../../util/redirect.ts'

export const handler: RouteHandler<unknown, unknown> = {
  GET: (_ctx) => redirect(`/regulator/organizations`),
}
