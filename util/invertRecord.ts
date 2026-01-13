import { assert } from 'std/assert/assert.ts'
import entries from './entries.ts'
import fromEntries from './fromEntries.ts'

export function invertRecord(record: Record<string, string>) {
  const seen = new Set<string>()
  return fromEntries(
    entries(record).map(([key, value]) => {
      assert(!seen.has(value), `Already saw ${value}`)
      seen.add(value)
      return [value, key]
    }),
  )
}
