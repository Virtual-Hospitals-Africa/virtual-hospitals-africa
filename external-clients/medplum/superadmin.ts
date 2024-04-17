import { Command } from '../../util/command.ts'
import { mergeReadableStreams } from 'std/streams/merge_readable_streams.ts'
import { readerFromStreamReader } from 'https://deno.land/std@0.164.0/streams/conversion.ts'
import { readLines } from 'https://deno.land/std@0.164.0/io/buffer.ts'

export function start() {
  const medplum_app_dir = `${Deno.cwd()}/medplum/packages/app`

  const server = Command('npm', {
    args: ['run', 'dev'/*, `file:${vha_medplum_config_file}`*/],
    cwd: medplum_app_dir,
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
  const { server, lines } = start()

  for await (const line of lines) {
    if (line.includes(':3000')) {
      break
    }
  }

  return server
}

if (import.meta.main) {
  await run()
}
