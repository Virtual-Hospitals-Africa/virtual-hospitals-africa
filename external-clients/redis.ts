import { connect } from 'redis'
import { assert } from 'std/assert/assert.ts'

interface RedisConnectionOptions {
  username?: string
  password?: string
  hostname: string
  port: number
}

export function parseRedisConnectionString(
  connectionString: string,
): RedisConnectionOptions {
  const regex = /^redis:\/\/(?:(.*?)(?::(.*?))?@)?(.*):(\d+)\/?$/
  const match = connectionString.match(regex)

  assert(match, 'Invalid Redis connection string format.')

  return {
    username: match[1],
    password: match[2],
    hostname: match[3],
    port: parseInt(match[4], 10),
  }
}

const connectionOpts = () => {
  const redisUrl = Deno.env.get('REDISCLOUD_URL')
  return redisUrl ? parseRedisConnectionString(redisUrl) : {
    hostname: 'localhost',
    port: parseInt(Deno.env.get('REDIS_PORT')!) || 6379,
    password: (Deno.env.get('REDIS_PASSWORD')),
  }
}

export const opts = connectionOpts()

export const redis =
  (Deno.env.get('BUILDING') ? undefined : await connect(opts))!

// deno-lint-ignore no-explicit-any
export function cacheable<F extends (...args: any[]) => Promise<any>>(
  fn: F,
): F {
  const function_name = fn.name
  assert(function_name, 'Function must have a name')
  return ((async (...args: Parameters<F>) => {
    const arg_key = args.map((arg) => JSON.stringify(arg)).join(',')
    const key = `${function_name}:${arg_key}`
    const result = await redis.get(key)
    if (result) return JSON.parse(result)
    return fn(...args).then((result) => {
      redis.set(key, JSON.stringify(result))
      return result
    })
  }) as unknown as F)
}
