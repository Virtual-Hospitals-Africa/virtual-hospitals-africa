import { humanReadableJson } from './humanReadableJson.ts'

export function assertUnreachable(x: never): never {
  throw new Error(`Unreachable case: ${humanReadableJson(x)}`)
}
