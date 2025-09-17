import { getFileLineNumber } from './getFileLineNumber.ts'

export const originalLog = console.log

// Monkey-patch console.log to print the timestamp + file & line number
export function monkeyPatchConsole() {
  if (console.log !== originalLog) return
  console.log = (...args: unknown[]) => {
    const line_number = getFileLineNumber(1)
    const timestamp = new Date().toISOString()
    originalLog(timestamp, line_number, ...args)
  }
}

if (import.meta.main) {
  monkeyPatchConsole()
}
