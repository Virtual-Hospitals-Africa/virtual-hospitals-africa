import { redis } from '../external-clients/redis.ts'
import { dropEverything } from './dropEverything.ts'

console.log('Flushing redis...')
await redis.flushdb()

console.log('Redoing all migrations...')

console.log('Dropping everything...')
await dropEverything()
