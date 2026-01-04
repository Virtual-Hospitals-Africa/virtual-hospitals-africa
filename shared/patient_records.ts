import {
  Maybe,
  RecordDisplays,
  RecordValue,
  RecordValueSnomedConcept,
  RenderedSnomedConcept,
} from '../types.ts'
import compact from '../util/compact.ts'
import { positive_decimal } from '../util/validators.ts'
import isDate from '../util/isDate.ts'

type DisplayableRecord = {
  root_snomed_concept: RenderedSnomedConcept
  specific_snomed_concept?: Maybe<RenderedSnomedConcept>
  value?: Maybe<RecordValue>
  prefixes?: DisplayableRecord[]
  // Attributes are not included as part of the display, but listed here for completeness
}

function measurementValueDisplay(
  { value, units }: { value: string | number; units: string },
): string {
  positive_decimal.parse(value)
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

function valueDisplay(
  value: Exclude<NonNullable<DisplayableRecord['value']>, string>,
): string {
  switch (value.type) {
    case 'event':
      return formatEventDatetime(value.datetime)
    case 'snomed_concept':
      return value.name
    case 'measurement':
      return measurementValueDisplay(value)
    default: {
      throw new Error(`Unexpected type in ${JSON.stringify(value)}`)
    }
  }
}

function includeRootSnomedConceptName(
  root_snomed_concept: RenderedSnomedConcept,
): boolean {
  switch (root_snomed_concept.name) {
    case 'Attribute':
    case 'Event':
    case 'Measurement finding':
    case 'Clinical finding':
      return false
    default:
      return true
  }
}

function buildDisplays(record: DisplayableRecord): RecordDisplays {
  const {
    root_snomed_concept,
    specific_snomed_concept,
    value,
    prefixes = [],
  } = record

  const prefix_displays = prefixes.map((prefix) => buildDisplays(prefix).full)

  const finding_display = compact([
    ...prefix_displays,
    specific_snomed_concept?.name,
    includeRootSnomedConceptName(root_snomed_concept) &&
    root_snomed_concept.name,
  ]).join(' ')

  if (!value) {
    return {
      value: null,
      finding: finding_display,
      full: finding_display,
    }
  }

  const value_display = value && valueDisplay(value)

  return {
    finding: finding_display,
    value: value_display,
    full: `${finding_display}: ${value_display}`,
  }
}

type RenderedDisplayableRecord<DR extends DisplayableRecord> =
  & Omit<DR, 'value_snomed_concept'>
  & { displays: RecordDisplays; value: RecordValue | null }

function mergeValuesAddDisplay<DR extends DisplayableRecord>(
  record: DR,
): RenderedDisplayableRecord<DR> {
  return {
    ...record,
    value: record.value || null,
    displays: buildDisplays(record),
  }
}

export function formatRecord<
  DR extends DisplayableRecord & {
    value_snomed_concept?: null | RecordValueSnomedConcept
    attributes: DisplayableRecord[]
    events: DisplayableRecord[]
  },
>(record: DR): RenderedDisplayableRecord<DR> & {
  value: RecordValue | null
  attributes: RenderedDisplayableRecord<DR['attributes'][number]>[]
  events: RenderedDisplayableRecord<DR['events'][number]>[]
} {
  return {
    ...mergeValuesAddDisplay(record),
    attributes: record.attributes.map(mergeValuesAddDisplay),
    events: record.events.map(mergeValuesAddDisplay),
  }
}
