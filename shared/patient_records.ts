import { assert } from 'std/assert/assert.ts'
import { Maybe } from '../types.ts'
import { assertArrayEmpty } from '../util/arraySize.ts'
import partition from '../util/partition.ts'
import compact from '../util/compact.ts'

type DisplayableRecord = {
  name: string
  finding_name?: Maybe<string>
  value_name?: Maybe<string>
  value?: Maybe<number | string>
  units?: Maybe<string>
  qualifiers: DisplayableRecord[]
}

function measurementValueDisplay(
  { value, units }: { value: string | number; units: string },
): string {
  switch (units) {
    case '°C':
    case '%':
      return `${value}${units}`
    default:
      return `${value} ${units}`
  }
}

export function buildValueDisplay(
  { name, qualifiers, finding_name, value_name, value, units }:
    DisplayableRecord,
): {
  full_display: string
  value_display: string
} {
  const [attribute_qualifiers, prefix_qualifiers] = partition(
    qualifiers || [],
    (q) => !!q.value_name,
  )

  assertArrayEmpty(attribute_qualifiers)

  // For measurements skip the "Measurement finding" bit
  if (value != null) {
    assert(finding_name)
    assert(units)
    assertArrayEmpty(prefix_qualifiers)
    const value_display = measurementValueDisplay({ value, units })
    return {
      value_display,
      full_display: `${finding_name}: ${value_display}`
    }
  }

  const finding_display = compact([
    ...prefix_qualifiers.map(buildValueDisplay),
    finding_name,
    name,
  ]).join(' ')

  if (!value_name) {
    return { full_display: finding_display, value_display: finding_display }
  }

  assert(!value)
  assert(!units)
  return {
    full_display: `${finding_display}: ${value_name}`, value_display: value_name
  }
}
