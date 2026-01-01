import { assert } from 'std/assert/assert.ts'
import { Maybe, RecordDisplays, RenderedSnomedConcept } from '../types.ts'
import { assertArrayEmpty } from '../util/arraySize.ts'
import compact from '../util/compact.ts'
import { SnomedCategory } from '../db.d.ts'
import isObjectLike from '../util/isObjectLike.ts'
import isString from '../util/isString.ts'
import { positive_decimal } from '../util/validators.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import isDate from '../util/isDate.ts'
import type { AttributeValue } from '../db/models/patient_record_qualifiers.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'

type DisplayableRecord = {
  root_snomed_concept: RenderedSnomedConcept
  finding?: Maybe<RenderedSnomedConcept>
  value: 
  value?: Maybe<string | DisplayableRecord | AttributeValue>
  units?: Maybe<string>
  prefixes?: DisplayableRecord[]
  // Attributes are not included as part of the display, but listed here for completeness
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

function formatEventDatetime(datetime: Date | string): string {
  const date = isDate(datetime) ? datetime : new Date(datetime)
  const time_formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Africa/Johannesburg',
  })
  const date_formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Africa/Johannesburg',
  })
  const time_str = time_formatter.format(date).toLowerCase()
  const date_str = date_formatter.format(date)
  return `${time_str} SAST | ${date_str}`
}

function isDisplayableRecord(value: unknown): value is DisplayableRecord {
  return isObjectLike(value) && isString(value.name) && isString(value.category)
}

function valueDisplay(
  value: Exclude<NonNullable<DisplayableRecord['value']>, string>,
): string {
  if (isDisplayableRecord(value)) {
    return buildDisplays(value).full_display
  }
  assert(value.type === 'event', 'type: snomed_concept is a DisplayableRecord')
  return formatEventDatetime(value.datetime)
}

function buildDisplays(record: DisplayableRecord): RecordDisplays {
  const {
    name,
    prefixes = [],
    finding_name,
    value_name,
    value,
    units,
  } = record

  // For measurements skip the "Measurement finding" bit
  if (isString(value)) {
    assertEquals(name, 'Measurement finding')
    positive_decimal.parse(value)
    assert(finding_name)
    assertNotEquals(finding_name, 'Measurement')
    assertNotEquals(finding_name, 'Measurement finding')
    assert(units)
    assert(isString(units))
    assertArrayEmpty(prefixes)
    const value_display = measurementValueDisplay({ value, units })
    return {
      value: value_display,
      finding: finding_name,
      full: `${finding_name}: ${value_display}`,
    }
  }

  const prefix_displays = prefixes.map((prefix) =>
    buildDisplays(prefix).full_display
  )

  const finding_display = compact([
    ...prefix_displays,
    finding_name,
    !['Attribute', 'Event'].includes(name) && name,
  ]).join(' ')

  if (value) {
    assert(isObjectLike(value), `Unexpected value ${value}`)
    assert(!value_name)

    const value_display = valueDisplay(value)
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
    finding,
    value: value_name,
    full: `${finding_display}: ${value_name}`,
  }
}

export function formatRecordDisplay<
  R extends DisplayableRecord & {
    attributes: DisplayableRecord[]
    events: DisplayableRecord[]
  },
>(record: R): R & { displays: RecordDisplays } & {
  attributes: Array<R['attributes'][number] & { displays: RecordDisplays }>
  events: Array<R['events'][number] & { displays: RecordDisplays }>
} {
  return {
    ...record,
    ...buildDisplays(record),
    attributes: record.attributes.map((attribute) => ({
      ...attribute,
      ...buildDisplays(attribute),
    })),
    events: record.events.map((event) => ({
      ...event,
      ...buildDisplays(event),
    })),
  }
}
