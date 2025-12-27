type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never
}[keyof T]

export default function sumBy<T>(
  arr: T[],
  iteratee: NumericKeys<T> | ((obj: T) => number),
): number {
  const getter = typeof iteratee === 'function'
    ? iteratee
    : (obj: T) => obj[iteratee as keyof T] as number

  let sum = 0
  for (const item of arr) {
    sum += getter(item)
  }
  return sum
}
