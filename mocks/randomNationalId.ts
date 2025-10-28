import randomDigits from './randomDigits.ts'
import randomLetter from './randomLetter.ts'

export default function randomNationalId(country: 'ZA' | 'ZW' = 'ZA') {
  switch (country) {
    case 'ZA':
      return randomDigits(13)
    case 'ZW':
      return `${randomDigits(2)}-${randomDigits(7)} ${randomLetter()} ${
        randomDigits(2)
      }`
  }
}
