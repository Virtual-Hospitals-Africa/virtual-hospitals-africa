import { attachTrx } from '../../backend/attachTrx.ts'
import { timeMiddlewareCallNext } from '../../backend/timeMiddleware.ts'

export const handler = [
  timeMiddlewareCallNext(attachTrx),
]
