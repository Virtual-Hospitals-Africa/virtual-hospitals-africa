import { assert } from 'std/assert/assert.ts'
import { redis } from './redis.ts'

const inMemoryCache = new Map()

let loggedNoRedisWarning = false
function getRedisIfConnected() {
  if (redis?.isConnected) {
    return redis
  }
  if (!loggedNoRedisWarning) {
    console.log(
      'No connection could be established to redis, falling back to process memory',
    )
    loggedNoRedisWarning = true
  }
}

export function get(
  key: string,
): Promise<string | undefined> {
  const r = getRedisIfConnected()
  return r ? redis.get(key) : inMemoryCache.get(key)
}

export function set(key: string, value: string) {
  const r = getRedisIfConnected()
  return r ? redis.set(key, value) : inMemoryCache.set(key, value)
}

export function flushdb() {
  const r = getRedisIfConnected()
  return r ? redis.flushdb() : inMemoryCache.clear()
}
// deno-lint-ignore no-explicit-any
export function cacheable<F extends (...args: any[]) => Promise<any>>(
  fn: F,
): F {
  const function_name = fn.name
  assert(function_name, 'Function must have a name')
  return ((async (...args: Parameters<F>) => {
    const key = `${function_name}:${JSON.stringify(args)}`
    const result = await get(key)

    if (result) return JSON.parse(result)
    return fn(...args).then((result) => {
      set(key, JSON.stringify(result))
      return result
    })
  }) as unknown as F)
}
