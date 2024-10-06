import { runCommand } from '../util/command.ts'
import { migrate } from './migrate.ts'
import { parseArgs } from '@std/cli/parse-args'
import { spinner } from '../util/spinner.ts'
import { onLocalhost } from './onLocalhost.ts'
import { drop } from './drop.ts'
import { recreate } from './recreate.ts'

export async function reset(opts: { recreate?: boolean | string[] } = {}) {
  await recreate()
  await migrate.all(opts)
  await runCommand('deno', {
    args: ['task', 'db:codegen'],
  })
}

if (import.meta.main) {
  const flags = parseArgs(Deno.args)
  let recreate = flags.r || flags.recreate
  if (typeof recreate === 'string') {
    recreate = recreate.split(',')
  }
  await reset({ recreate })
}
