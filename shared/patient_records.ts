import { assert } from 'std/assert/assert.ts'
import { Maybe, RecordDisplays } from '../types.ts'
import { assertArrayEmpty } from '../util/arraySize.ts'
import partition from '../util/partition.ts'
import compact from '../util/compact.ts'
import { SnomedCategory } from '../db.d.ts'
import isNumber from '../util/isNumber.ts'
import isKeyOf from '../util/isKeyOf.ts'
import isObjectLike from '../util/isObjectLike.ts'
import omit from '../util/omit.ts'

type DisplayableRecord = {
  name: string
  category: SnomedCategory
  finding_name?: Maybe<string>
  value_name?: Maybe<string>
  value?: Maybe<number | string | DisplayableRecord>
  units?: Maybe<string>
  prefixes?: DisplayableRecord[]
  // Attributes are not included as part of the display, but listed here for completeness
  attributes?: DisplayableRecord[]
}

function measurementValueDisplay(
  { value, units }: { value: string | number; units: string },
): string {
  switch (units) {
    case '°C':
    case '%':
      return `${value}${units}`
    default:
      return `${value} ${units}`
  }
}

export function buildValueDisplay(record: DisplayableRecord): RecordDisplays {
  assert(
    !isKeyOf('attributes', record),
    'If passing attributes use formatRecordDisplay instead',
  )
  const { name, prefixes = [], finding_name, value_name, value, units } = record
  // For measurements skip the "Measurement finding" bit
  if (isNumber(value)) {
    assert(finding_name)
    assert(units)
    assertArrayEmpty(prefixes)
    const value_display = measurementValueDisplay({ value, units })
    return {
      value_display,
      finding_display: finding_name,
      full_display: `${finding_name}: ${value_display}`,
    }
  }

  const finding_display = compact([
    ...prefixes.map((prefix) => buildValueDisplay(prefix).full_display),
    finding_name,
    name,
  ]).join(' ')

  if (value) {
    assert(isObjectLike(value))
    assert(!value_name)
    const value_display = buildValueDisplay(value).full_display
    return {
      finding_display,
      value_display,
      full_display: `${finding_display}: ${value_display}`,
    }
  }

  if (!value_name) {
    return {
      finding_display,
      full_display: finding_display,
      value_display: null,
    }
  }

  assert(!value)
  assert(!units)
  return {
    finding_display,
    value_display: value_name,
    full_display: `${finding_display}: ${value_name}`,
  }
}

export function formatRecordDisplay<
  R extends DisplayableRecord & {
    attributes: DisplayableRecord[]
  },
>(record: R): R & RecordDisplays & {
  attributes: Array<R['attributes'][number] & RecordDisplays>
} {
  console.log(record)
  return {
    ...record,
    ...buildValueDisplay(omit(record, ['attributes'])),
    attributes: record.attributes.map((attribute) => ({
      ...attribute,
      ...buildValueDisplay(attribute),
    })),
  }
}
