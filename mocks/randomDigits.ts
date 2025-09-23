import randomDigit from './randomDigit.ts'

export default function randomDigits(length: number) {
  return Array.from({ length }, randomDigit).join('')
}
