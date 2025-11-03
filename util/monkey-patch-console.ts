import { readBooleanEnvironmentVariable } from './env.ts'
import { getFileLineNumber } from './getFileLineNumber.ts'

const NO_MONKEY_PATCH_CONSOLE = readBooleanEnvironmentVariable(
  'NO_MONKEY_PATCH_CONSOLE',
)
export const originalLog = console.log

// Monkey-patch console.log to print the timestamp + file & line number
export function monkeyPatchConsole() {
  if (console.log !== originalLog) return
  if (NO_MONKEY_PATCH_CONSOLE) return
  console.log = (...args: unknown[]) => {
    const line_number = getFileLineNumber(2)
    const timestamp = new Date().toISOString()
    originalLog(timestamp, line_number, ...args)
  }
}

if (import.meta.main) {
  monkeyPatchConsole()
}
