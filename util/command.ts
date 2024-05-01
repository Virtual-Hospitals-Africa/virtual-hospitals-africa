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

export async function runCommand(
  command: string,
  options?: Deno.CommandOptions,
) {
  const result = await Command(command, options).output()
  if (result.code) {
    console.error(new TextDecoder().decode(result.stderr))
    return Deno.exit(result.code)
  }
  return new TextDecoder().decode(result.stdout)
}
