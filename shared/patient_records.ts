import {
  IntermediateBaseRecord,
  RecordDisplays,
  RenderedAttribute,
  RenderedEvaluation,
  RenderedSnomedConcept,
} from '../types.ts'
import compact from '../util/compact.ts'
import { positive_decimal } from '../util/validators.ts'
import isDate from '../util/isDate.ts'
import partition from '../util/partition.ts'
import { assert } from 'std/assert/assert.ts'
import { assertAll } from '../util/assertAll.ts'
import omit from '../util/omit.ts'
import assertOneOf from '../util/assertOneOf.ts'

type DisplayableRecord = IntermediateBaseRecord & {
  qualifiers?: DisplayableRecord[]
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
    case 'score':
      return value.score
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
    case 'Qualifier value':
    case 'Evaluation - action':
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
    qualifiers = [],
  } = record

  for (const qualifier of qualifiers) {
    assert(!qualifier.value)
  }
  const prefix_displays = qualifiers.map((prefix) => buildDisplays(prefix).full)

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

/**
 * The idea here is that the qualifiers (at this point all prefixes)
 */
function addDisplay<DR extends DisplayableRecord>(
  record: DR,
): Omit<DR, 'qualifiers'> & {
  displays: RecordDisplays
} {
  return {
    ...omit(record, ['qualifiers']),
    displays: buildDisplays(record),
  }
}

export function formatRecord<
  DR extends DisplayableRecord & {
    evaluations: DisplayableRecord[]
  },
>(record: DR): Omit<DR, 'qualifiers'> & {
  displays: RecordDisplays
  attributes: RenderedAttribute[]
  evaluations: RenderedEvaluation[]
} {
  const [unformatted_attributes, prefixes] = partition(
    record.qualifiers || [],
    (qualifier) => !!qualifier.value,
  )

  const attributes = unformatted_attributes.map(addDisplay)
  assertAll(attributes, (attribute): asserts attribute is RenderedAttribute => {
    assert(attribute.value)
    assertOneOf(attribute.value.type, [
      'event' as const,
      'snomed_concept' as const,
    ])
  })

  const evaluations = record.evaluations.map(addDisplay)

  return {
    ...addDisplay({ ...record, qualifiers: prefixes }),
    attributes,
    evaluations,
  }
}
