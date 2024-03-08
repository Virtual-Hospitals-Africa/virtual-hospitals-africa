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

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
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
  }

  current[keys[keys.length - 1]] = value
  return obj
}
