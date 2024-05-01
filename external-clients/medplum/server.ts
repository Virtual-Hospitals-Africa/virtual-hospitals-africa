import { opts as database_opts } from '../../db/db.ts'
import { opts as redis_opts } from '../redis.ts'
import { Command } from '../../util/command.ts'
import { mergeReadableStreams } from 'std/streams/merge_readable_streams.ts'
import { readerFromStreamReader } from 'https://deno.land/std@0.164.0/streams/conversion.ts'
import { readLines } from 'https://deno.land/std@0.164.0/io/buffer.ts'

const MEDPLUM_SERVER_PORT = Deno.env.get('MEDPLUM_SERVER_PORT') || '8103'

export async function start() {
  const medplum_server_dir = `${Deno.cwd()}/medplum/packages/server`
  const medplum_config_path = `${medplum_server_dir}/medplum.config.json`
  const medplum_config_contents = await Deno.readTextFile(medplum_config_path)
  const medplum_config_contents_with_port = medplum_config_contents.replace(
    /8103/g,
    MEDPLUM_SERVER_PORT,
  )
  const medplum_config = JSON.parse(medplum_config_contents_with_port)

  const vha_medplum_config_file = await Deno.makeTempFile()

  const vha_medplum_config = {
    ...medplum_config,
    database: database_opts,
    redis: redis_opts,
    logRequests: true,
  }

  await Deno.writeTextFile(
    vha_medplum_config_file,
    JSON.stringify(vha_medplum_config, null, 2),
  )

  const server = Command('npm', {
    args: ['run', 'dev', `file:${vha_medplum_config_file}`],
    cwd: medplum_server_dir,
    stdout: 'piped',
    stderr: 'piped',
  }).spawn()

  const [server_output1, server_output2] = mergeReadableStreams(
    server.stdout,
    server.stderr,
  ).tee()

  server_output1.pipeTo(Deno.stdout.writable)

  const lines = readLines(readerFromStreamReader(server_output2.getReader()))

  return { server, lines }
}

// Run the medplum server against the local database, resolving when the server is up
// Note: running the server runs the migrations
export async function run(): Promise<Deno.ChildProcess> {
  const { server, lines } = await start()

  for await (const line of lines) {
    if (line.includes('Server started')) {
      break
    }
  }

  return server
}

// Running the server runs the migrations, so we just need to run the server
// and then kill it to run the migrations
// export async function runMigrations() {
//   const { lines } = await start()

//   for await (const line of lines) {
//     if (
//       line.includes('Server started') ||
//       line.includes('"msg":"Database schema migration","version":"v67"')
//     ) {
//       break
//     }
//   }

//   console.log('killing medplum server')
//   // server.kill('SIGTERM')

//   // This leaves a zombie process, which we kill in the parent task in deno.json
//   // server.unref()
// }

if (import.meta.main) {
  await run()
}
