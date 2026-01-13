import { Formatter } from 'fracturedjsonjs'
import { MostlyJsonSerializable } from '../types.ts'

const formatter = new Formatter()

export function humanReadableJson(object: JsonSerializable): string {
  return formatter.Serialize(object)!
}
