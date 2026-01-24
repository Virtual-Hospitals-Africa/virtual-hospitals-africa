import z from 'zod'
import { postHandler } from '../../backend/postHandler.ts'

export const handler = postHandler(z.object({}), (_ctx) => {
  throw new Error('Nope!')
})
