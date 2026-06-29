import { attachTrx } from '../../backend/attachTrx.ts'
import { timeMiddlewareCallNext } from '../../backend/timeMiddleware.ts'

export const handler = [
  // attachTrx returns void; wrap it so the middleware chain continues via ctx.next()
  timeMiddlewareCallNext(attachTrx),
]
