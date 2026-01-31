import z from 'zod'
import { postHandler } from '../../backend/postHandler.ts'

export const handler = postHandler(z.object({}), (ctx) => {
  const correlation_id = ctx.req.headers.get('x-correlation-id')
  console.log({ correlation_id })
  throw new Error('Nope!')
})
