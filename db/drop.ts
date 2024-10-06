import { redis } from '../external-clients/redis.ts'
import { spinner } from '../util/spinner.ts'
import { runCommand } from '../util/command.ts'
import { onLocalhost } from './onLocalhost.ts'

export async function drop() {
  const db_opts = onLocalhost()

  await spinner('Flushing redis', redis.flushdb().then(() => 'Redis flushed'))

  await spinner(
    'Dropping database',
    async () => {
      await runCommand('dropdb', {
        args: [db_opts.dbname, '-U', db_opts.username],
      })
      return 'Database dropped'
    },
  ).catch((e) => {
    if (e.message.includes('other session')) {
      console.error('Database is in use, cannot drop.')
      Deno.exit(1)
    }
    return 'Database does not exist, skipping drop.'
  })
}

if (import.meta.main) {
  await drop()
}
