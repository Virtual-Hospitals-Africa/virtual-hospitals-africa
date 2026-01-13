import { MostlyJsonSerializable } from '../types.ts'
import { humanReadableJson } from './humanReadableJson.ts'

export function errorMessageWithJsonContext(message: string, context?: MostlyJsonSerializable): string {
  return message + '\n' + humanReadableJson(context)
}
