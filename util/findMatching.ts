import matching from './matching.ts'

export default function findMatching<T>(
  items: Array<T>,
  pattern: Partial<T>,
): T {
  const match = matching(pattern)
  for (const item of items) {
    if (match(item)) {
      return item
    }
  }
  throw new Error(
    `No item found matching ${JSON.stringify(pattern)} in ${
      JSON.stringify(items)
    }`,
  )
}
