import * as db from './db.ts'
import { runCommand } from '../util/command.ts'
import { assert } from 'std/assert/assert.ts'
import { spinner } from '../util/spinner.ts'

export function restore(name: string) {
  const dump_file = `./db/dumps/${name}`
  return spinner(
    `Restoring database from ${dump_file}`,
    runCommand('pg_restore', {
      args: ['--no-owner', '-d', db.uri, dump_file],
    }),
  )
}

if (import.meta.main) {
  const dumps = Array.from(Deno.readDirSync('./db/dumps'))
  const [name] = Deno.args
  assert(
    name,
    `Please provide a valid name for the dump file as in "deno task db:restore ${
      dumps[0].name
    }"`,
  )
  const dump_exists = dumps.find((it) => it.name === name)
  assert(
    dump_exists,
    `Dump file ${name} not found in ./db/dumps. Available dumps: ${
      dumps.map((it) => it.name).join(', ')
    }`,
  )
  await restore(name)
}
