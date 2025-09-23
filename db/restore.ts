import * as db from './db.ts'
import { Command } from '../util/command.ts'
import { assert } from 'std/assert/assert.ts'
import readLines from '../util/readLines.ts'

export async function restore(name: string) {
  const dump_file = `./db/dumps/${name}`
  console.log(`Restoring database from ${dump_file}...`)

  const args = ['--no-owner', '-v', '-d', db.uri, dump_file]

  const process = Command('pg_restore', {
    args,
    stdout: 'piped',
    stderr: 'piped',
    verbose: true,
  }).spawn()

  const logStdOut = async () => {
    for await (const line of readLines(process.stdout)) {
      console.log(line)
    }
  }
  const logStdErr = async () => {
    for await (const line of readLines(process.stderr)) {
      console.log(line)
    }
  }

  logStdOut()
  logStdErr()
  const status = await process.status
  assert(!status.code)
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
