import { redis } from '../external-clients/redis.ts'
import { spinner } from '../util/spinner.ts'
import { dropEverything } from './dropEverything.ts'

await spinner('Flushing redis', redis.flushdb())
await spinner('Dropping everything', dropEverything())
