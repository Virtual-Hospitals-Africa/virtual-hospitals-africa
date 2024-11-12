import { ZodError } from 'zod'
import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertThrows } from 'std/assert/assert_throws.ts'
import * as validators from '../../util/validators.ts'

describe('validators', () => {
  describe('national_id_number', () => {
    it('parses a legitimate national_id_number', () => {
      const national_id_number = validators.national_id_number.parse(
        '63-817312 A 56',
      )
      assertEquals(national_id_number, '63-817312 A 56')
    })

    it('parses a legitimate national_id_number in lowercase', () => {
      const national_id_number = validators.national_id_number.parse(
        '63-817312 a 56',
      )
      assertEquals(national_id_number, '63-817312 A 56')
    })

    it('throws an error on an illegitimate national_id_number', () => {
      const error = assertThrows(() =>
        validators.national_id_number.parse('63-8312 A 56')
      )
      assert(error instanceof ZodError)
      assertEquals(error.issues, [
        {
          validation: 'regex',
          code: 'invalid_string',
          message: 'Invalid',
          path: [],
        },
      ])
    })
  })

  describe('phone_number', () => {
    it('parses a legitimate phone number, returning just the number', () => {
      const phone_number = validators.e164_phone_number.parse(
        '+254 712 345 678',
      )
      assertEquals(phone_number, '+254712345678')
    })

    it("parses a legitimate phone number as a phone number, even if that string doesn't include a leading +", () => {
      const phone_number = validators.e164_phone_number.parse('254712345678')
      assertEquals(phone_number, '+254712345678')
    })

    it('parses a legitimate phone number as a phone number, converting it to a string', () => {
      const phone_number = validators.e164_phone_number.parse(254712345678)
      assertEquals(phone_number, '+254712345678')
    })

    it('throws an error on an illegitimate phone number', () => {
      const error = assertThrows(() =>
        validators.e164_phone_number.parse('MY HAMSTER IS NAMED TERRENCE')
      )
      assert(error instanceof ZodError)
      assertEquals(error.issues, [
        {
          code: 'custom',
          message: 'Invalid phone number',
          path: [],
        },
      ])
    })
  })
})
