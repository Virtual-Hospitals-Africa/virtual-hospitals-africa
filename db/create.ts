import { runCommandAssertExitCodeZero } from '../util/command.ts'
import { spinner } from '../util/spinner.ts'
import { argsAndEnvForPostgresScript } from './argsAndEnvForPostgresScript.ts'

export function create() {
  const args_and_env = argsAndEnvForPostgresScript()
  // Allows vha_dev & vha_test to be created at the same time without stomping on each other
  if (Deno.env.get('IS_TEST')) {
    args_and_env.args.push('--template', 'template0')
  }

  return spinner(
    'Creating database',
    runCommandAssertExitCodeZero('createdb', args_and_env),
  )
}

if (import.meta.main) {
  await create()
}
