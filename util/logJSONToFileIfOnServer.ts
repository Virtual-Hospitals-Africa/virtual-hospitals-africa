import { humanReadableJson } from './humanReadableJson.ts'
import generateUUID from './uuid.ts'

// deno-lint-ignore no-explicit-any
export function logJSONToFileIfOnServer(to_log: any) {
  if (globalThis.Deno) {
    const file_name = './logs/' + generateUUID() + '.json'
    globalThis.Deno.writeTextFileSync(file_name, humanReadableJson(to_log))
    console.log(`Logged to ${file_name}`)
  }
}
