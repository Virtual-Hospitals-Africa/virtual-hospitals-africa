export function min<T extends string | number>(array: T[]): T | undefined {
  if (array.length === 0) {
    return undefined // Handle empty array case
  }
  return array.reduce((min, current) => (current < min ? current : min))
}
