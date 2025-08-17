import { runCommandAssertExitCodeZero } from '../util/command.ts'
import { spinner } from '../util/spinner.ts'
import { onLocalhost } from './onLocalhost.ts'

export function create() {
  const { host, database, user, password } = onLocalhost()
  const args = ['-h', host, '-U', user, '-w', database]
  if (password) {
    args.push('-W')
    args.push(password)
  }
  return spinner('Creating database', async () => {
    await runCommandAssertExitCodeZero('createdb', {
      args,
    })
  })
}

if (import.meta.main) {
  await create()
}
