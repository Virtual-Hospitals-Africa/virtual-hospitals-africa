import randomDigits from './randomDigits.ts'

export default function randomPhoneNumber(country: 'ZA' | 'ZW' = 'ZA') {
  switch (country) {
    case 'ZA':
      return '+27' + randomDigits(9)
    case 'ZW':
      return '+26377' + randomDigits(7)
    default:
      throw new Error(`Unknown country: ${country}`)
  }
}
