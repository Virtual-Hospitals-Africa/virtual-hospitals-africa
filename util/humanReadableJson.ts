import { Formatter } from 'fracturedjsonjs'
import { MostlyJsonSerializable } from '../types.ts'

const formatter = new Formatter()

export function humanReadableJson(object: MostlyJsonSerializable): string {
  return formatter.Serialize(object)!
}
