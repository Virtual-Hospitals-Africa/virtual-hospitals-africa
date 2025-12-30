import { assert } from 'std/assert/assert.ts'
import { Maybe, RecordDisplays } from '../types.ts'
import { assertArrayEmpty } from '../util/arraySize.ts'
import compact from '../util/compact.ts'
import { SnomedCategory } from '../db.d.ts'
import isObjectLike from '../util/isObjectLike.ts'
import isString from '../util/isString.ts'
import { positive_decimal } from '../util/validators.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

type DisplayableRecord = {
  name: string
  category: SnomedCategory
  finding_name?: Maybe<string>
  value_name?: Maybe<string>
  value?: Maybe<string | DisplayableRecord>
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

function buildValueDisplay(record: DisplayableRecord): RecordDisplays {
  const {
    name,
    category,
    prefixes = [],
    finding_name,
    value_name,
    value,
    units,
  } = record

  // For measurements skip the "Measurement finding" bit
  if (isString(value)) {
    assertEquals(finding_name, 'Measurement')
    positive_decimal.parse(value)
    assert(finding_name)
    assert(units)
    assert(isString(units))
    assertArrayEmpty(prefixes)
    const value_display = measurementValueDisplay({ value, units })
    return {
      value_display,
      finding_display: finding_name,
      full_display: `${finding_name}: ${value_display}`,
    }
  }

  const prefix_displays = prefixes.map((prefix) =>
    buildValueDisplay(prefix).full_display
  )

  // Omit the "Attribute" bit from displays. Attributes display underneath findings,
  // not on their own so this is implied.
  if (name === 'Attribute') {
    assertEquals(category, 'attribute')
    assert(finding_name)
    assert(value_name)

    const finding_display = compact([
      ...prefix_displays,
      finding_name,
    ]).join(' ')

    return {
      finding_display,
      value_display: value_name,
      full_display: `${finding_display}: ${value_name}`,
    }
  }

  const finding_display = compact([
    ...prefix_displays,
    finding_name,
    name,
  ]).join(' ')

  if (value) {
    assert(isObjectLike(value), `Unexpected value ${value}`)
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
  return {
    ...record,
    ...buildValueDisplay(record),
    attributes: record.attributes.map((attribute) => ({
      ...attribute,
      ...buildValueDisplay(attribute),
    })),
  }
}
