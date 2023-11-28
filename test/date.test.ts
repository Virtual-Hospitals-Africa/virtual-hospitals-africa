import { assertEquals } from 'std/assert/assert_equals.ts'
import { prettyPatientDateOfBirth } from '../util/date.ts'
import { assertThrows } from 'https://deno.land/std@0.160.0/testing/asserts.ts'

Deno.test('prettyPatientDateOfBirth', () => {
  const dob = prettyPatientDateOfBirth('1990-03-01')
  assertEquals(dob, '1 March 1990')
})

Deno.test('test invalid date in pretty dob', () => {
  assertThrows(() => {
    prettyPatientDateOfBirth('9999-99-99')
  }, Error, 'The date provided is invalid, please check and try again.')
})
