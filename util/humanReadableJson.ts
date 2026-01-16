import { Formatter } from 'fracturedjsonjs'
import { MostlyJsonSerializable, Result } from '../types.ts'
import { assert } from 'std/assert/assert.ts'
import { parse } from 'std/path/parse.ts'
import { wrapError } from './wrapError.ts'

const formatter = new Formatter()

export function humanReadableJson(object: MostlyJsonSerializable): string {
  return formatter.Serialize(object)!
}

function isValidFile(filename: string): Result<string> {
  try {
    const parsed = parse(filename)
    if (!parsed.base || parsed.base === '.' || parsed.base === '..') {
      return { success: false as const, error: new Error(`${filename} is not a valid filename`) }
    }

    const info = Deno.statSync(parsed.dir)

    if (!info.isDirectory) {
      return { success: false, error: new Error('not a directory') }
    }

    return {
      success: true as const,
      value: filename,
    }
  } catch (error) {
    return { success: false as const, error: wrapError(`File is not valid ${filename}`, error) }
  }
}

export function logReadableJson(object: MostlyJsonSerializable, filename?: string) {
  const json = humanReadableJson(object)

  if (!filename) {
    return console.log(json)
  }

  assert(isValidFile(filename))

  Deno.writeTextFileSync(filename, json)
}
