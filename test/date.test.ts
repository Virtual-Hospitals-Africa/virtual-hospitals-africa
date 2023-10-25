import { assertEquals } from 'std/assert/assert_equals.ts'
import { prettyPatientDateOfBirth } from '../util/date.ts'

Deno.test('prettyPatientDateOfBirth', () => {
  const dob = prettyPatientDateOfBirth('1990-03-01')
  assertEquals(dob, '1 March 1990')
})
