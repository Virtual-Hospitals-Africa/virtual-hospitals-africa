import { assert } from 'std/assert/assert.ts'
import { Maybe } from '../types.ts'
import { assertArrayEmpty } from '../util/arraySize.ts'
import partition from '../util/partition.ts'

type DisplayableRecord = {
  name: string
  value_name?: Maybe<string>
  qualifiers: DisplayableRecord[]
}

export function buildValueDisplay(
  record: DisplayableRecord,
): string {
  const [attribute_qualifiers, prefix_qualifiers] = partition(
    record.qualifiers || [],
    (q) => !!q.value_name,
  )
  let value_display = record.name
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
  if (record.value_name) {
    value_display += `: ${record.value_name}`
  }
  console.log({ record, value_display })
  return value_display
}
