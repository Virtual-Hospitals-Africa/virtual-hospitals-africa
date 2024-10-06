import { TerminalSpinner } from 'https://deno.land/x/spinners@v1.1.2/mod.ts'

export async function spinner<T>(
  description: string,
  task: Promise<T> | (() => Promise<T>),
  opts?: { success: string },
) {
  const spinner = new TerminalSpinner(description)
  spinner.start()
  const result = typeof task === 'function' ? await task() : await task
  const to_print = opts?.success || (
    !!result && typeof result === 'string'
      ? result
      : description.replaceAll('ing ', 'ed ')
  )
  spinner.succeed(to_print)
  return result
}
