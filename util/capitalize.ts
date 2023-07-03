import words from './words.ts'

export default function capitalize(str: string) {
  return words(str)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
