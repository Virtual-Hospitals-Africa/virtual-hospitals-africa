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

type Opts = Deno.CommandOptions & {
  verbose?: boolean
}

export function runCommand(
  command: string,
  { args, verbose, ...opts }: Opts = {},
) {
  const [program, ...args_in_command] = command.split(' ')
  if (args_in_command.length) {
    assert(!args, 'Ambiguous args')
    args = args_in_command
  }
  if (verbose) {
    console.log([program].concat(args || []).join(' '))
  }
  return Command(program, { args, ...opts }).output()
}

export async function runCommandAssertExitCodeZero(
  command: string,
  options?: Opts,
) {
  const result = await runCommand(command, options)
  if (result.code) {
    const error = new TextDecoder().decode(result.stderr)
    console.error(command, options)
    throw new Error(error)
  }
  if (options?.stdout === 'inherit') {
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
