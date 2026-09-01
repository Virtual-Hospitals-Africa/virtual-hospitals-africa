import { assert } from 'std/assert/assert.ts'
import { humanReadableJson } from './humanReadableJson.ts'
import { readBooleanEnvironmentVariable } from './env.ts'
import generateUUID from './uuid.ts'

// Opt-in: writing debug artifacts to ./logs is a local development convenience.
// On deployed servers we rely on stdout/stderr, which docker logs captures.
const LOG_TO_FILE = !!globalThis.Deno && readBooleanEnvironmentVariable('LOG_TO_FILE')

type LogOpts = {
  subdirectory?: string
  extension?: string
  filename?: string
  file_prefix?: string
}

// deno-lint-ignore no-explicit-any
export function logToFileIfOnServer(to_log: any, opts?: LogOpts) {
  if (!LOG_TO_FILE) return
  const subdirectory = opts?.subdirectory || ''
  const file_prefix = opts?.file_prefix || ''
  const filename = opts?.filename || file_prefix + generateUUID()
  const extension = opts?.extension || filename.includes('.') ? '' : '.json'
  if (subdirectory) assert(subdirectory.startsWith('/'))
  const directory = `./logs${subdirectory}`
  const file_name = `${directory}/${filename}${extension}`
  globalThis.Deno.mkdir(directory, { recursive: true })
    .then(() => globalThis.Deno.writeTextFile(file_name, typeof to_log === 'string' ? to_log : humanReadableJson(to_log)))
    .then(() => console.log(`Logged to ${file_name}`))
    .catch((error) => console.warn(`Could not log to ${file_name}`, error))
}
