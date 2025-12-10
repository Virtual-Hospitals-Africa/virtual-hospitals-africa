export function toRecord<K extends string | number | symbol, V>(
  input: Map<K, V>,
): Partial<Record<K, V>>
export function toRecord<K extends string | number | symbol, V>(
  input: Record<K, V>,
): Record<K, V>
export function toRecord<K extends string | number | symbol, V>(
  input: Partial<Record<K, V>>,
): Partial<Record<K, V>>
export function toRecord<K extends string | number | symbol, V>(
  input: Map<K, V> | Record<K, V>,
): Record<K, V> | Partial<Record<K, V>> {
  if (input instanceof Map) {
    return Object.fromEntries(input) as Partial<Record<K, V>>
  }
  return input
}
