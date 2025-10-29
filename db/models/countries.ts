import { assert } from 'std/assert/assert.ts'
import * as addresses from './addresses.ts'

export const SERVER_COUNTRY = Deno.env.get('SERVER_COUNTRY') || 'ZA'
assert(addresses.TO_COUNTRY_OFFICIAL_NAME.has(SERVER_COUNTRY))
