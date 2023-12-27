// deno-lint-ignore no-unused-vars
import db from './db/db.ts'
import { assert } from 'std/assert/assert.ts'

// deno-lint-ignore no-explicit-any
const models: any = {}
for (const migrationFile of Deno.readDirSync('./db/models')) {
  const [migrationName, fileExt] = migrationFile.name.split('.')
  assert(fileExt === 'ts', 'Only .ts files are supported')
  const migration = await import(`./db/models/${migrationFile.name}`)
  models[migrationName] = migration
}
