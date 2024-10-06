import * as db from './db.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'


export function onLocalhost() {
  assert(db.opts)
  assertEquals(
    db.opts.host,
    'localhost',
    'This script only works on localhost, not production',
  )
  return db.opts
}
