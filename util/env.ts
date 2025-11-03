import { assert } from 'std/assert/assert.ts'
import { positive_integer } from './validators.ts'

export function readPositiveIntegerEnvironmentVariable(
  key: string,
): undefined | number {
  if (!Deno.env.has(key)) return
  const value = Deno.env.get(key)
  return positive_integer.parse(value)
}

export function readBooleanEnvironmentVariable(
  key: string,
): boolean {
  if (!Deno.env.has(key)) return false
  const value = Deno.env.get(key)
  switch (value) {
    case '1':
    case 'true':
      return true
    case '0':
    case 'false':
      return false
    default: {
      throw new Error(
        `Expected a value that could be interpreted as a boolean for ${key}. Got ${value}`,
      )
    }
  }
}

export function readMandatoryStringEnvironmentVariable(
  key: string,
): string {
  assert(Deno.env.has(key), `Expected enviornment variable to be set ${key}`)
  return Deno.env.get(key)!
}
