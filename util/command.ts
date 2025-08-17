import { assert } from 'std/assert/assert.ts'

export const Command: (
  command: string,
  options?: Deno.CommandOptions,
) => Deno.Command = (Deno.build.os === 'windows')
  ? (cmd, options) =>
    new Deno.Command(
      'C:\\Program Files\\Git\\bin\\sh.exe',
      {
        ...options,
        args: options?.args?.length ? [cmd, ...options.args] : [cmd],
      },
    )
  : (cmd, options) => new Deno.Command(cmd, options)

const USE_DOCKER_FOR_POSTGRES_COMMANDS = !!Deno.env.get(
  'USE_DOCKER_FOR_POSTGRES_COMMANDS',
)

const POSTGRES_COMMANDS = new Set([
  'dropdb',
  'createdb',
  'pg_dump',
  'pg_restore',
  './db/seed/tsv_load.sh',
  './db/seed/tsv_dump.sh',
])

type Opts = Deno.CommandOptions & {
  verbose?: boolean
}

export function runCommand(
  command: string,
  { args, verbose, ...opts }: Opts = {},
) {
  assert(
    !command.includes('\n'),
    'No newlines allowed. If forming a complex command, use the args option',
  )
  if (command.includes(' ')) {
    assert(
      !command.includes('"') && !command.includes("'"),
      "For a one line command, don't include quotes. If forming a complex command, use the args option",
    )
  }
  let [program, ...args_in_command] = command.split(' ')
  if (args_in_command.length) {
    assert(
      !args,
      'Ambiguous args. If the provided command has multiple args, you cannot also include args in options',
    )
    args = args_in_command
  }
  if (USE_DOCKER_FOR_POSTGRES_COMMANDS && POSTGRES_COMMANDS.has(program)) {
    args = args || []
    if (program.endsWith('.sh')) {
      args = ['exec', 'vha_postgres', 'bash', program].concat(args)
      program = 'docker'
    } else {
      args = ['exec', 'vha_postgres', program].concat(args)
      program = 'docker'
    }
  }
  if (verbose) {
    console.log([program].concat(args || []).join(' '))
  }
  return Command(program, { args, ...opts }).output()
}

export async function runCommandAssertExitCodeZero(
  command: string,
  opts: Opts = {},
) {
  const result = await runCommand(command, opts)
  if (result.code) {
    const error = new TextDecoder().decode(result.stderr)
    console.error(command, opts)
    throw new Error(error)
  }
  if (opts?.stdout === 'inherit') {
    return ''
  }
  return new TextDecoder().decode(result.stdout)
}

export async function directoryExists(
  path: string,
): Promise<boolean> {
  const { code } = await runCommand('test', {
    args: ['-d', path],
  })
  return code === 0
}

export async function rmrf(path: string) {
  await runCommand('rm', {
    args: ['-rf', path],
  })
}
