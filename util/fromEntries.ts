export default function fromEntries<K extends string, V>(
  entries: Iterable<[K, V]>,
): { [k in K]: V } {
  return Object.fromEntries(entries) as { [k in K]: V }
}
