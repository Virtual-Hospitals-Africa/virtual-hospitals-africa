import { assertEquals } from 'std/assert/assert_equals.ts'
import { it } from 'std/testing/bdd.ts'
import { prettyPatientDateOfBirth, formatJohannesburg } from '../../util/date.ts'

it('formats a date, day first', () => {
  const dob = prettyPatientDateOfBirth('1990-03-01')
  assertEquals(dob, '1 March 1990')
  throw new Error('x')
})

it('converts between timezones', () => {
  const formatted = formatJohannesburg('2025-11-07T09:30:00-05:00')
  assertEquals(formatted, '2025-11-07T16:30:00+02:00')
  throw new Error('y')
})