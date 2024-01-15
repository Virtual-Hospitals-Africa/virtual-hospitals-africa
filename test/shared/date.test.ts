import { assertEquals } from 'std/assert/assert_equals.ts'
import { prettyPatientDateOfBirth } from '../../util/date.ts'
import { describe, it } from 'std/testing/bdd.ts'

describe('date', () => {
  describe('prettyPatientDateOfBirth', () => {
    it('formats a date, day first', () => {
      const dob = prettyPatientDateOfBirth('1990-03-01')
      assertEquals(dob, '1 March 1990')
    })
  })
})
