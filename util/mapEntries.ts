import { toRecord } from './toRecord.ts'

export default function mapEntries<K extends string, VStart, VEnd>(
  record: Record<K, VStart>,
  map: (value: VStart, key: K) => VEnd,
): { [k in K]: VEnd }
export default function mapEntries<K extends string, VStart, VEnd>(
  record: Partial<Record<K, VStart>>,
  map: (value: VStart, key: K) => VEnd,
): Partial<{ [k in K]: VEnd }>
export default function mapEntries<K extends string, VStart, VEnd>(
  record: Map<K, VStart>,
  map: (value: VStart, key: K) => VEnd,
): Partial<{ [k in K]: VEnd }>
export default function mapEntries<K extends string, VStart, VEnd>(
  record: Record<K, VStart> | Map<K, VStart>,
  map: (value: VStart, key: K) => VEnd,
): { [k in K]: VEnd } | Partial<{ [k in K]: VEnd }> {
  return Object.fromEntries(
    // deno-lint-ignore no-explicit-any
    Object.entries(toRecord(record as any)).map((
      [key, value],
    ) => [key, map(value as VStart, key as K)]),
  ) as { [k in K]: VEnd }
}
