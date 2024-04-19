import { assertOr400 } from './assertOr.ts'
import isObjectLike from './isObjectLike.ts'
import last from './last.ts'

// deno-lint-ignore-file no-explicit-any
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

  if (!isObjectLike(current)) {
    const earlier_keys_str = earlier_keys.join('.')
    assertOr400(
      false,
      `attempting to assign property ${last_key} to ${earlier_keys_str}, but ${earlier_keys_str} is a ${typeof current}`,
    )
  }

  current[last_key] = value
  return obj
}
