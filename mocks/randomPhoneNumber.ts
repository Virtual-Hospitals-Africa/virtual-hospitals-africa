import randomDigits from './randomDigits.ts'

export default function randomPhoneNumber() {
  return '+26377' + randomDigits(7)
}
