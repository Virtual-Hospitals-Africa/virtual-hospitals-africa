import { redis } from '../external-clients/redis.ts'
import { dropEverything } from './dropEverything.ts'
import { migrate } from './migrate.ts'

console.log('Flushing redis...')
await redis.flushdb()

console.log('Redoing all migrations...')

console.log('Dropping everything...')
await dropEverything()

console.log('Migrating to latest...')
await migrate('latest')

console.log('Loading seeds...')
await migrate('seeds:load')
