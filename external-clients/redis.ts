import 'dotenv'
import { connect } from 'redis'

const connectionOpts = () => {
  const redisUrl = Deno.env.get('REDISCLOUD_URL')

  if (!redisUrl) {
    return { password: undefined, hostname: 'localhost', port: 6379 }
  }

  const match = redisUrl.match(/redis:\/\/(.*):(.*)@(.*):(.*)/)

  if (!match) throw new Error('Invalid redis url')

  const [, , password, hostname, port] = match

  return { password, hostname, port }
}

const opts = connectionOpts()
export const redis = await connect(opts)

export async function cacheFacilityAddress(
  longitude: number,
  latitude: number,
  address: string,
) {
  const key = `facility:${longitude},${latitude}`

  await redis.set(key, address)
  console.log('cache address into redis: ' + key + ': ' + address)
}

export async function getFacilityAddress(
  longitude: number,
  latitude: number,
): Promise<string | null> {
  const key = `facility:${longitude},${latitude}`
  const address = await redis.get(key)
  return address
}
