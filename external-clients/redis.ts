import { assert } from 'std/assert/assert.ts'
import { connect } from 'redis'
import { NO_EXTERNAL_CONNECT } from '../util/env.ts'
// import { onProduction } from '../util/onProduction.ts'
// import Redlock from 'redlock'

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
  const redis_url = Deno.env.get('REDISCLOUD_URL')
  return redis_url ? parseRedisConnectionString(redis_url) : {
    hostname: 'localhost',
    port: parseInt(Deno.env.get('REDIS_PORT')!) || 6379,
    password: (Deno.env.get('REDIS_PASSWORD')),
  }
}

export const opts = connectionOpts()

export const redis = (NO_EXTERNAL_CONNECT ? undefined : await connect(opts).catch((_err) => {
  // Redis isn't needed to run locally or on prod
  // console.error(err)
}))!

// export const lock = redis && new Redlock([redis])
