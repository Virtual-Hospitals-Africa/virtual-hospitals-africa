import { readBooleanEnvironmentVariable } from './env.ts'
import { getFileLineNumber } from './getFileLineNumber.ts'
import { once } from './once.ts'

const NO_MONKEY_PATCH_CONSOLE = readBooleanEnvironmentVariable(
  'NO_MONKEY_PATCH_CONSOLE',
)
export const original_log = console.log

// Monkey-patch console.log to print the timestamp + file & line number
export const monkeyPatchConsole = once(function monkeyPatchConsole() {
  // if (console.log !== original_log) return
  // if (NO_MONKEY_PATCH_CONSOLE) return
  // console.log = (...args: unknown[]) => {
  //   let line_number = getFileLineNumber(2)
  //   // Total hack (but this whole thing is a hack!) if debugLog is called print the line debugLog was called from
  //   if (line_number.includes('db/helpers.ts')) {
  //     line_number = getFileLineNumber(3)
  //   }
  //   const timestamp = new Date().toISOString()
  //   original_log(timestamp, line_number, ...args)
  // }
})

if (import.meta.main) {
  monkeyPatchConsole()
}
