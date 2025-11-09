export default function remove<T>(
  array: T[],
  ...exclude: T[]
): T[] {
  return array.filter((item) => !exclude.includes(item))
}
