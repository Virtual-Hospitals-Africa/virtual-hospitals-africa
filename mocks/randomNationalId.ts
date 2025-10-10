import randomDigits from './randomDigits.ts'
import randomLetter from './randomLetter.ts'

export default function randomNationalId(country: 'za' | 'zw' = 'za') {
  switch (country) {
    case 'za':
      return randomDigits(13)
    case 'zw':
      return `${randomDigits(2)}-${randomDigits(7)} ${randomLetter()} ${
        randomDigits(2)
      }`
  }
}
