import { assert } from 'std/assert/assert.ts'
import { TO_COUNTRY_OFFICIAL_NAME } from './addresses.ts'

export const SERVER_COUNTRY = Deno.env.get('SERVER_COUNTRY') || 'ZA'
assert(TO_COUNTRY_OFFICIAL_NAME.has(SERVER_COUNTRY))

export const SERVER_TIMEZONE = Deno.env.get('SERVER_TIMEZONE') ||
  'Africa/Johannesburg'
