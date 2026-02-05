import { assert } from 'std/assert/assert.ts'
import { assertOr400, StatusError } from './assertOr.ts'
import isObjectLike from './isObjectLike.ts'
import last from './last.ts'

// deno-lint-ignore no-explicit-any
export default function set(obj: any, path: string, value: any) {
  const keys = path.split('.').flatMap((key) => {
    const match = key.match(/^(.+)\[(\d+)\]$/)
    if (!match) {
      return key
    }
    return [match[1], match[2]]
  })
  let current = obj

  const earlier_keys = keys.slice(0, -1)
  const last_key = last(keys)!
  earlier_keys.forEach((key, i) => {
    // deno-lint-ignore no-prototype-builtins
    if (!current.hasOwnProperty(key)) {
      // Create an array if the next key is a number
      if (/^\d+$/.test(keys[i + 1])) {
        current[key] = []
      } else {
        current[key] = {}
      }
    }

    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return obj
    }

    current = current[key]
  })

  if (Array.isArray(current)) {
    const index = parseInt(last_key)
    assert(!isNaN(index), `Trying to set ${last_key} on an array`)
    current[index] = value
    return obj
  }

  if (isObjectLike(current)) {
    current[last_key] = value
    return obj
  }

  const earlier_keys_str = earlier_keys.join('.')
  throw new StatusError(`attempting to assign property ${last_key} to ${earlier_keys_str}, but ${earlier_keys_str} is a ${typeof current}`, 400)
}
