import 'dotenv'
import { connect } from 'redis'
import { Location } from '../types.ts'

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

export async function getDistanceFromRedis(
  origin: Location,
  destination: Location,
): Promise<string | null> {
  const key = constructKey(origin, destination)
  return await redis.get(key)
}

export async function cacheDistanceInRedis(
  origin: Location,
  destination: Location,
  distance: string,
) {
  const key = constructKey(origin, destination)
  await redis.set(key, distance)
  console.log('cache distance successfully ' + key + ': ' + distance)
}

export function constructKey(origin: Location, destination: Location): string {
  const coord1 = `${origin.latitude},${origin.longitude}`
  const coord2 = `${destination.latitude},${destination.longitude}`
  if (coord1 < coord2) {
    return coord1 + ':' + coord2
  } else {
    return coord2 + ':' + coord1
  }
}
