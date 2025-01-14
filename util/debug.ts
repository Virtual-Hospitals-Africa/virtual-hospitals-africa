export function debug(message: string) {
  const err = new Error()
  const stackLine = err.stack!.split('\n')[2] // Get the relevant stack trace line
  const match = stackLine.match(/(?:\()?(.*):(\d+):(\d+)\)?/) // Regex to extract file, line, and column
  const file = match ? match[1] : 'unknown file'
  const line = match ? match[2] : 'unknown line'

  console.log(`[${file}:${line}] ${message}`)
}
