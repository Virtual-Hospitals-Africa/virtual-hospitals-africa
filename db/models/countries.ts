import { assert } from 'std/assert/assert.ts'
import { addresses } from './addresses.ts'

export const SERVER_COUNTRY = Deno.env.get('SERVER_COUNTRY') || 'ZA'
assert(addresses.TO_COUNTRY_OFFICIAL_NAME.has(SERVER_COUNTRY))

export const SERVER_TIMEZONE = Deno.env.get('SERVER_TIMEZONE') ||
  'Africa/Johannesburg'
