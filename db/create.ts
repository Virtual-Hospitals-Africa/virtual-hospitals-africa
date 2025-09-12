import { runCommandAssertExitCodeZero } from '../util/command.ts'
import { spinner } from '../util/spinner.ts'
import { argsAndEnvForPostgresScript } from './argsAndEnvForPostgresScript.ts'

export function create() {
  return spinner(
    'Creating database',
    runCommandAssertExitCodeZero('createdb', argsAndEnvForPostgresScript()),
  )
}

if (import.meta.main) {
  await create()
}
