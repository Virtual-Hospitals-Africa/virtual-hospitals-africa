import { migrate } from './migrate.ts'
import { dropEverything } from './meta.ts'

await dropEverything()
await migrate('latest')
