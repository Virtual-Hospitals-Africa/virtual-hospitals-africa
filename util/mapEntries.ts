export default function mapEntries<K extends string, VStart, VEnd>(
  record: Record<K, VStart>,
  map: (value: VStart, key: K) => VEnd,
): { [k in K]: VEnd } {
  return Object.fromEntries(
    Object.entries(record).map((
      [key, value],
    ) => [key, map(value as VStart, key as K)]),
  ) as { [k in K]: VEnd }
}
