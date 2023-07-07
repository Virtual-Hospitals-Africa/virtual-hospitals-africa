type FlattenArray<T> = T extends Array<infer U> ? U : T

export default function flatten<T>(array: T[]): FlattenArray<T>[] {
  const result: FlattenArray<T>[] = []

  for (const item of array) {
    if (Array.isArray(item)) {
      result.push(...flatten(item))
    } else {
      result.push(item as FlattenArray<T>)
    }
  }

  return result
}
