import * as cache from '../external-clients/cache.ts'
import { runCommand } from '../util/command.ts'
import { spinner } from '../util/spinner.ts'
import { onLocalhost } from './onLocalhost.ts'

export async function drop() {
  const db_opts = onLocalhost()

  await spinner('Flushing cache', async () => {
    await cache.flushdb()
  })

  await spinner(
    'Dropping database',
    () =>
      runCommand('dropdb', {
        args: [
          db_opts.database,
          '-U',
          db_opts.user,
          '--port',
          String(Deno.env.get('DOCKER_POSTGRES_PORT') || db_opts.port),
        ],
      }).catch((e) => {
        if (e.message.includes('other session')) {
          throw new Error('Database is in use, cannot drop.')
        }
        if (e.message.includes('does not exist')) {
          return 'Database does not exist, skipping drop.'
        }
        throw e
      }),
  )
}

if (import.meta.main) {
  await drop()
}
