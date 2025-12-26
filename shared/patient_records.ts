import { assert } from 'std/assert/assert.ts'
import { Maybe } from '../types.ts'
import { assertArrayEmpty } from '../util/arraySize.ts'
import partition from '../util/partition.ts'
import assertLength from '../util/assertLength.ts'

type DisplayableRecord = {
  name: string
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
  { name, qualifiers, value_name, value, units }: DisplayableRecord,
): string {
  const [attribute_qualifiers, prefix_qualifiers] = partition(
    qualifiers || [],
    (q) => !!q.value_name,
  )

  // For measurements skip the "Measurement finding" bit
  if (value != null) {
    assert(units)
    assertLength(prefix_qualifiers, 1)
    return `${buildValueDisplay(prefix_qualifiers[0])}: ${
      measurementValueDisplay({ value, units })
    }`
  }

  let value_display = name
  prefix_qualifiers.forEach((prefix_qualifier) => {
    assert(!prefix_qualifier.value_name)
    const qualifier_value_display = buildValueDisplay(prefix_qualifier)
    value_display = `${qualifier_value_display} ${value_display}`
  })

  assertArrayEmpty(attribute_qualifiers)
  // attribute_qualifiers.forEach((attribute_qualifier) => {
  //   assert(attribute_qualifier.value_name)
  //   value_display +=
  //     ` ${attribute_qualifier.name} ${attribute_qualifier.value_name}`
  // })
  if (value_name) {
    assert(!value)
    assert(!units)
    value_display += `: ${value_name}`
  }
  return value_display
}
