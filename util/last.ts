export default function last<T>(array: T[]): T | undefined {
  if (array.length === 0) {
    return undefined
  }

  return array[array.length - 1]
}
