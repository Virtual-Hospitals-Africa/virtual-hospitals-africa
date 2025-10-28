import { assert } from 'std/assert/assert.ts'
import { Sex } from '../types.ts'
import { parseDate } from './date.ts'
import { assertOr400 } from './assertOr.ts'
import { asResult, Result } from './asResult.ts'

// Uses the Luhn Algorithm
// Adapted from https://github.com/tiaanduplessis/mod10-check-digit/blob/master/index.js
export function mod10CheckDigit(number: string) {
  assert(number.length === 12)
  let doubled_sum = 0
  for (const [index, digit] of Array.from(number).entries()) {
    const int = parseInt(digit, 10)
    assert(int)
    if (index % 2 === 0) {
      doubled_sum += int
    } else {
      const double = int * 2
      doubled_sum += double > 9 ? double - 9 : double
    }
  }

  return (doubled_sum * 9) % 10
}

type NationalIdCheckInput = {
  sex: Sex
  date_of_birth: string
  national_id_number: string
}

export function validateSouthAfricanNationalIdNumber(
  { sex, date_of_birth, national_id_number }: NationalIdCheckInput,
) {
  assertOr400(
    national_id_number.length === 13,
    'National ID number must be 13 digits',
  )
  assertOr400(
    /^\d{2}[0-1][0-9][0-3]\d\d{4}[0-1]\d{2}$/.test(national_id_number),
    'National ID number must be 13 digits',
  )

  const dob = parseDate(date_of_birth)

  const check_dob = national_id_number.substring(0, 6)

  assertOr400(
    check_dob === `${dob.year.slice(0, 2)}${dob.month}${dob.day}`,
    'Date of birth must match the date of birth in the national ID number',
  )

  const check_sex = parseInt(national_id_number.substring(6, 10))

  switch (sex) {
    case 'male':
      assertOr400(
        check_sex >= 5000 && check_sex <= 9999,
        'The provided sex does not match the sex in the national ID number. Expected 5000-9999, but received ' +
          check_sex,
      )
      break
    case 'female':
      assertOr400(
        check_sex >= 0 && check_sex <= 4999,
        'The provided sex does not match the sex in the national ID number. Expected 0000-4999, but received ' +
          check_sex,
      )
      break
  }

  const to_validate = national_id_number.slice(0, 12)
  const last_digit = national_id_number[12]
  assert(last_digit)
  const last_int = parseInt(last_digit, 10)
  assert(last_int)
  const check_sum = mod10CheckDigit(to_validate)
  assertOr400(
    check_sum === last_int,
    'The national ID number is invalid. Please check that it was entered correctly and try again',
  )
}

export function nationalIdCheckResult(
  opts: NationalIdCheckInput,
): Result<void> {
  return asResult(() => validateSouthAfricanNationalIdNumber(opts))
}
