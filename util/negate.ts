export default function negate<T>(predicate: (item: T) => boolean) {
  return (item: T): boolean => !predicate(item)
}
