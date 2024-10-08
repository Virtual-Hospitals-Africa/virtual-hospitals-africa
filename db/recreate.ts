import { runCommand } from '../util/command.ts'
import { spinner } from '../util/spinner.ts'
import { onLocalhost } from './onLocalhost.ts'
import { drop } from './drop.ts'

export async function recreate() {
  const db_opts = onLocalhost()

  await drop()

  await spinner('Recreating database', async () => {
    const args = [
      '-h',
      db_opts.host,
      '-U',
      db_opts!.username,
      '-w',
      db_opts.dbname,
    ]
    if (db_opts.password) {
      args.push('-W')
      args.push(db_opts.password)
    }
    await runCommand('createdb', {
      args,
    })
    return 'Recreated database'
  })
}

if (import.meta.main) {
  await recreate()
}
