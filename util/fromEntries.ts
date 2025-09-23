export default function fromEntries<K extends string, V>(
  entries: [K, V][],
): { [k in K]: V } {
  return Object.fromEntries(entries) as { [k in K]: V }
}
