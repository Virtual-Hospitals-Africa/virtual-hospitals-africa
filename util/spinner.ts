import { TerminalSpinner } from 'spinners'
import { readBooleanEnvironmentVariable } from './env.ts'

const CI = readBooleanEnvironmentVariable('CI')

// Avoid printing excessive messages on CI
class NonSpinner {
  constructor(public message: string) {}
  start() {
    console.log(this.message)
  }
  succeed(to_print: string) {
    console.log(to_print)
  }
  fail() {}
}

const Spinner = CI ? NonSpinner : TerminalSpinner

export async function spinner<T>(
  description: string,
  task: Promise<T> | (() => Promise<T>),
  opts?: { success: string; bubble_error?: boolean },
) {
  const spinner = new Spinner(description)
  spinner.start()
  try {
    const result = await (typeof task === 'function' ? task() : task)
    const to_print = opts?.success || (
      !!result && typeof result === 'string' ? result : description.replaceAll('ing ', 'ed ')
    )
    spinner.succeed(to_print)
    return result
  } catch (err) {
    spinner.fail()
    console.error(err)
    if (opts?.bubble_error) {
      throw err
    } else {
      Deno.exit(1)
    }
  }
}
