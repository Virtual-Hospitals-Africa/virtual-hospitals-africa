import { runCommand } from '../util/command.ts'
import { spinner } from '../util/spinner.ts'
import { onLocalhost } from './onLocalhost.ts'

export function create() {
  const { host, dbname, username, password } = onLocalhost()
  const args = ['-h', host, '-U', username, '-w', dbname]
  if (password) {
    args.push('-W')
    args.push(password)
  }
  return spinner('Creating database', async () => {
    await runCommand('createdb', {
      args,
    })
  })
}

if (import.meta.main) {
  await create()
}
