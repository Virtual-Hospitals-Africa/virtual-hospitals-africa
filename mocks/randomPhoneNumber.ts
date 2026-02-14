import { getExample, parsePhoneNumber } from 'awesome-phonenumber'
import { assert } from 'std/assert/assert.ts'
import randomDigits from './randomDigits.ts'
import memoize from '../util/memoize.ts'

const already_generated = {
  'ZA': new Set(),
  'ZW': new Set(),
}

const countryDetails = memoize((country: keyof typeof already_generated = 'ZA') => {
  const example = getExample(country, 'mobile')
  assert(example.valid)

  const { international } = example.number
  const match = international.match(/^\+(\d+) (\d+) ([\d ]+)$/)
  assert(match)
  const country_code = match[1]
  const region_code = match[2]
  const remaining_significant_digits = match[3].replaceAll(' ', '').length
  return { country_code, region_code, remaining_significant_digits }
})

export default function randomPhoneNumber(country: keyof typeof already_generated = 'ZA'): string {
  const { country_code, region_code, remaining_significant_digits } = countryDetails(country)

  let attempts = 0
  while (++attempts < 50) {
    const candidate = `+${country_code}${region_code}${randomDigits(remaining_significant_digits)}`
    const parsed = parsePhoneNumber(candidate)
    if (!parsed.valid) continue
    const { international } = parsed.number
    if (already_generated[country].has(international)) continue
    already_generated[country].add(international)
    return international
  }

  throw new Error(`Exceeded max attempts. Already generated ${already_generated[country].size} numbers`)
}
