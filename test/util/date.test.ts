import { assertEquals } from 'std/assert/assert_equals.ts'
import { formatJohannesburg, prettyPatientDateOfBirth } from '../../util/date.ts'
import { describe, it } from 'std/testing/bdd.ts'

describe('date', () => {
  describe('prettyPatientDateOfBirth', () => {
    it('formats a date, day first', () => {
      const dob = prettyPatientDateOfBirth('1990-03-01')
      assertEquals(dob, '1 March 1990')
    })
  })
  describe('formatJohannesburg', () => {
    it('converts between timezones', () => {
      const formatted = formatJohannesburg('2025-11-07T09:30:00-05:00')
      assertEquals(formatted, '2025-11-07T16:30:00+02:00')
    })

    it('gives the start of the day in Johannesburg', () => {
      const formatted = formatJohannesburg('2025-11-07')
      assertEquals(formatted, '2025-11-07T00:00:00+02:00')
    })

    it('handles parsed dates', () => {
      const formatted = formatJohannesburg({
        year: '2025',
        month: '11',
        day: '7',
        timezone: 'Africa/Johannesburg',
      })
      assertEquals(formatted, '2025-11-07T00:00:00+02:00')
    })
  })
})
