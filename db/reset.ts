import { migrate } from './migrate.ts'
import { parseArgs } from '@std/cli/parse-args'
import { recreate } from './recreate.ts'
import { restore } from './restore.ts'
import { codegenOnDev } from './codegenOnDev.ts'

export async function reset(
  opts: { recreate?: boolean | string[] } = {},
) {
  await recreate()
  await restore('snomed')
  await migrate.all(opts)
  await codegenOnDev()
}

if (import.meta.main) {
  const flags = parseArgs(Deno.args)
  let recreate = flags.r || flags.recreate
  if (typeof recreate === 'string') {
    recreate = recreate.split(',')
  }
  await reset({ recreate })
}
