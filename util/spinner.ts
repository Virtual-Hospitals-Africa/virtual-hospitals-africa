import { TerminalSpinner } from 'spinners'

export async function spinner<T>(
  description: string,
  task: Promise<T> | (() => Promise<T>),
) {
  const spinner = new TerminalSpinner(description)
  spinner.start()
  const result = typeof task === 'function' ? await task() : await task
  if (typeof result === 'string') {
    spinner.succeed(result)
  } else {
    spinner.succeed(description)
  }
  return result
}
