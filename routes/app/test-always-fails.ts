import z from 'zod'
import { postHandler } from '../../backend/postHandler.ts'

export const handler = postHandler(z.object({}), (ctx) => {
  const _correlation_id = ctx.req.headers.get('x-correlation-id')
  throw new Error('Nope!')
})
