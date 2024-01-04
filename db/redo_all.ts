import { dropEverything } from './meta.ts'
import { migrate } from './migrate.ts'

console.log('Redoing all migrations...')

console.log('Dropping everything...')
await dropEverything()

console.log('Migrating to latest...')
await migrate('latest')
