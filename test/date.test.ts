import { assertEquals } from 'std/assert/assert_equals.ts'
import { PatientDemographicInfo } from '../types.ts'
import { prettyPatientDateOfBirth } from '../util/date.ts'

Deno.test('prettyPatientDateOfBirth', () => {
  const dob = prettyPatientDateOfBirth({
    date_of_birth: new Date('1990-03-01'),
  } as PatientDemographicInfo)
  assertEquals(dob, 'March 1, 1990')
})
