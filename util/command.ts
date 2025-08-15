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

const USING_DOCKER = !!Deno.env.get('USING_DOCKER')

const POSTGRES_COMMANDS = new Set([
  'dropdb',
  'createdb',
  'pg_dump',
  'pg_restore',
])

export async function runCommand(
  command: string,
  { args, ...opts }: Deno.CommandOptions = {},
) {
  if (USING_DOCKER && POSTGRES_COMMANDS.has(command)) {
    args = ['exec', 'vha_postgres', command].concat(args || [])
    command = 'docker'
  }

  const result = await Command(command, { args, ...opts }).output()
  if (result.code) {
    const error = new TextDecoder().decode(result.stderr)
    console.error(command, { args, ...opts })
    throw new Error(error)
  }
  if (opts?.stdout === 'inherit') {
    return ''
  }
  return new TextDecoder().decode(result.stdout)
}
