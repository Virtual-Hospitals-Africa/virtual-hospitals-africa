import { Sex } from '../types.ts'
import { parseDate } from '../util/date.ts'
import sample from '../util/sample.ts'
import { mod10CheckDigit } from '../util/southAfricanNationalId.ts'
import randomDigits from './randomDigits.ts'
import randomLetter from './randomLetter.ts'

export default function randomNationalId({ country, sex, date_of_birth }: {
  country?: 'ZA' | 'ZW'
  sex: Sex
  date_of_birth: string
}) {
  switch (country || 'ZA') {
    case 'ZA': {
      const { year, month, day } = parseDate(date_of_birth)
      const date_portion = `${year.slice(-2)}${month}${day}`
      const first_sex_digit = sex === 'male' ? sample([5, 6, 7, 8, 9]) : sample([0, 1, 2, 3, 4])
      const other_sex_digits = randomDigits(3)
      const permanent_resident_digit = sample([0, 1])
      const last_digit = randomDigits(1)
      const first_twelve = `${date_portion}${first_sex_digit}${other_sex_digits}${permanent_resident_digit}${last_digit}`
      const checksum = mod10CheckDigit(first_twelve)
      return `${first_twelve}${checksum}`
    }

    case 'ZW':
      return `${randomDigits(2)}-${randomDigits(7)} ${randomLetter()} ${randomDigits(2)}`
  }
}
