import {
  IntermediateBaseRecord,
  Maybe,
  RecordDisplays,
  RecordValue,
  RecordValueLink,
  RenderedAttribute,
  RenderedEvaluation,
  RenderedRecordRelativeToHealthWorkerDef,
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
import { humanReadableJson } from '../util/humanReadableJson.ts'
import { inverseSExpression } from './s_expression_inverse.ts'
import { Lang } from './s_expression_schemas.ts'
import { parseExpression, parseExpressionExpectingAtom } from './s_expression.ts'
import { logArgsOnError } from '../util/decorators.ts'
import capitalize from '../util/capitalize.ts'
import isString from '../util/isString.ts'
import { MEASUREMENT_FINDING } from './snomed_concepts.ts'
import { SnomedCategory } from '../db.d.ts'

type DisplayableRecord = IntermediateBaseRecord & {
  qualifiers?: DisplayableRecord[]
}

type WithProperRecordValue<DR extends DisplayableRecord> = Omit<DR, 'value'> & {
  value: null | RecordValue
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

function toRenderedSnomedConcept(
  snomed_concept: Lang['snomed_concept'] | {
    name: string
    category: SnomedCategory
  },
): RenderedSnomedConcept {
  return {
    snomed_concept_id: '',
    name: snomed_concept.name,
    category: snomed_concept.category,
  }
}

const findingToDisplayableRecord = logArgsOnError(
  function findingToDisplayableRecord(
    finding: Lang['finding'],
  ): WithProperRecordValue<DisplayableRecord> {
    assert(finding.root_snomed_concept, 'Expected root_snomed_concept')
    assert(finding.specific_snomed_concept, 'Expected specific_snomed_concept')

    return {
      id: '',
      created_at: '',
      patient_encounter_id: '',
      root_snomed_concept_id: '',
      root_snomed_concept_name: finding.root_snomed_concept.name,
      root_snomed_concept_category: finding.root_snomed_concept.category,
      specific_snomed_concept_id: '',
      specific_snomed_concept_name: finding.specific_snomed_concept.name,
      specific_snomed_concept_category: finding.specific_snomed_concept.category,
      value: finding.value_snomed_concept
        ? {
          type: 'snomed_concept',
          ...toRenderedSnomedConcept(finding.value_snomed_concept),
        }
        : null,
      qualifiers: finding.qualifiers.map((q) => ({
        id: '',
        created_at: '',
        patient_encounter_id: '',
        root_snomed_concept_id: '',
        root_snomed_concept_name: 'Qualifier value',
        root_snomed_concept_category: 'qualifier value' as const,
        specific_snomed_concept_id: '',
        specific_snomed_concept_name: q.specific_snomed_concept.name,
        specific_snomed_concept_category: q.specific_snomed_concept.category,
        value: null,
        qualifiers: q.qualifiers.map((nested) => ({
          id: '',
          created_at: '',
          patient_encounter_id: '',
          root_snomed_concept_id: '',
          root_snomed_concept_name: 'Qualifier value',
          root_snomed_concept_category: 'qualifier value' as const,
          specific_snomed_concept_id: '',
          specific_snomed_concept_name: nested.specific_snomed_concept.name,
          specific_snomed_concept_category: nested.specific_snomed_concept.category,
          value: null,
        })),
      })),
    }
  },
)

const measurementToDisplayableRecord = logArgsOnError(
  function measurementToDisplayableRecord(
    measurement: Lang['measurement'],
  ): WithProperRecordValue<DisplayableRecord> {
    return {
      id: '',
      created_at: '',
      patient_encounter_id: '',
      root_snomed_concept_id: MEASUREMENT_FINDING.id,
      root_snomed_concept_name: MEASUREMENT_FINDING.name,
      root_snomed_concept_category: MEASUREMENT_FINDING.category,
      specific_snomed_concept_id: '',
      specific_snomed_concept_name: measurement.snomed_concept.name,
      specific_snomed_concept_category: measurement.snomed_concept.category,
      value: null,
      qualifiers: [],
    }
  },
)

function toDisplayableRecord(node: Lang['measurement' | 'finding']): WithProperRecordValue<DisplayableRecord> {
  switch (node.atom) {
    case 'finding':
      return findingToDisplayableRecord(node)
    case 'measurement':
      return measurementToDisplayableRecord(node)
  }
}

function valueDisplay(
  value: Exclude<NonNullable<WithProperRecordValue<DisplayableRecord>['value']>, string>,
): string | RecordValueLink {
  switch (value.type) {
    case 'event':
      return formatEventDatetime(value.datetime)
    case 'snomed_concept':
      return value.name
    case 'measurement':
      return measurementValueDisplay(value)
    case 'score':
      return value.score
    case 's_expression': {
      assertOneOf(value.node.atom, ['measurement' as const, 'finding' as const])
      return buildDisplays(toDisplayableRecord(value.node)).full
    }
    case 'link': {
      return value
    }
    default: {
      throw new Error(`Unexpected type in ${humanReadableJson(value)}`)
    }
  }
}

function includeRootSnomedConceptName(
  record: DisplayableRecord,
): boolean {
  switch (record.root_snomed_concept_name) {
    case 'Attribute':
    case 'Event':
    case 'Measurement finding':
    case 'Clinical finding':
    case 'Qualifier value':
    case 'Evaluation - action':
      return false
    case 'Procedure':
      return record.specific_snomed_concept_name !== 'Reference documentation'
    default:
      return true
  }
}

// In English, certain words connect things at the end
function qualifierIsPostfix(qualifier: Maybe<DisplayableRecord>): boolean {
  if (!qualifier) return false
  switch (qualifier.specific_snomed_concept_name) {
    case 'For':
    case 'With':
      return true
    default:
      return false
  }
}

function massageSpecificConceptDisplay(record: DisplayableRecord): string | null {
  if (!record.specific_snomed_concept_name) return null

  const replaced = record.specific_snomed_concept_name
    .replace(' (severity modifier)', '') // Oddly SNOMED puts (severity modifier) in _on top of_ (qualifier value)

  if (record.value?.type !== 'measurement') return replaced

  return replaced
    .replace(/^Body /, '')
    .replace(/, function$/, '')
}

function buildDisplays(
  record: WithProperRecordValue<DisplayableRecord>,
  postfix?: boolean,
): RecordDisplays {
  const {
    value,
    qualifiers = [],
  } = record

  assert(qualifiers.length <= 1)
  for (const qualifier of qualifiers) {
    assert(
      !qualifier.value,
      `Expected only prefixes (without value) saw ${humanReadableJson(qualifier)}`,
    )
  }
  const use_postfix = postfix || qualifierIsPostfix(qualifiers[0])

  const qualifier_displays = qualifiers.map((prefix) => buildDisplays(addNodeIfValueIsSExpression(prefix), use_postfix).full)

  const specific_concept_display = massageSpecificConceptDisplay(record)
  const specific_concept_display_capitalized = specific_concept_display && capitalize(specific_concept_display, { just_first: true })

  const maybe_root_concept_name = includeRootSnomedConceptName(record) && record.root_snomed_concept_name

  const finding_displays = compact([specific_concept_display_capitalized, maybe_root_concept_name])

  const finding_displays_qualified = use_postfix ? [...finding_displays, ...qualifier_displays] : [...qualifier_displays, ...finding_displays]

  const finding_display = finding_displays_qualified.join(' ')

  if (!value) {
    return {
      value: null,
      finding: finding_display,
      full: finding_display,
    }
  }

  const value_display = valueDisplay(value)

  return {
    finding: finding_display,
    value: value_display,
    full: `${finding_display}: ${isString(value_display) ? value_display : value_display.title}`,
  }
}

/**
 * The idea here is that the qualifiers with values are attributes and have
 * already been attached separately. The rest are prefixes which are consumed
 * as part of building out the record's displays
 */
function addDisplay<DR extends WithProperRecordValue<DisplayableRecord>>(
  record: DR,
): Omit<DR, 'qualifiers'> & {
  displays: RecordDisplays
} {
  return {
    ...omit(record, ['qualifiers']),
    displays: buildDisplays(record),
  }
}

// Little hacky. Maybe we put this in the database
function addNodeIfValueIsSExpression<DR extends DisplayableRecord>(record: DR): WithProperRecordValue<DR> {
  return {
    ...record,
    value: record.value && (record.value.type === 's_expression'
      ? {
        ...record.value,
        node: parseExpression(record.value.s_expression),
      }
      : record.value),
  }
}

export function formatRecord<
  DR extends DisplayableRecord & {
    evaluations: DisplayableRecord[]
  },
>(record: DR): Omit<WithProperRecordValue<DR>, 'qualifiers'> & {
  displays: RecordDisplays
  modifiers: IntermediateBaseRecord[]
  attributes: RenderedAttribute[]
  evaluations: RenderedEvaluation[]
} {
  const qualifiers = record.qualifiers || []

  const [modifiers, unformatted_attributes] = partition(
    qualifiers || [],
    (qualifier) => qualifier.root_snomed_concept_name === 'Qualifier value',
  )

  const attributes = unformatted_attributes.map(addNodeIfValueIsSExpression).map(addDisplay)
  assertAll(attributes, (attribute): asserts attribute is RenderedAttribute => {
    if (attribute.value) {
      assertOneOf(attribute.value.type, [
        'event' as const,
        'snomed_concept' as const,
      ])
    }
  })

  const evaluations = record.evaluations.map(addNodeIfValueIsSExpression).map(addDisplay)

  return {
    ...addDisplay({ ...addNodeIfValueIsSExpression(record), qualifiers: modifiers }),
    modifiers,
    attributes,
    evaluations,
  }
}

function toSnomedConcept(
  rendered: RenderedSnomedConcept,
): Lang['snomed_concept'] {
  return {
    atom: 'snomed_concept',
    name: rendered.name,
    category: rendered.category,
  }
}

function toQualifier(modifier: IntermediateBaseRecord): Lang['qualifier'] {
  return {
    atom: 'qualifier',
    specific_snomed_concept: {
      atom: 'snomed_concept',
      name: modifier.specific_snomed_concept_name,
      category: modifier.specific_snomed_concept_category,
    },
    qualifiers: [],
  }
}

export function asNormalFormSExpression<Rest>(
  record: RenderedRecordRelativeToHealthWorkerDef<
    'finding' | 'procedure' | 'evaluation',
    Rest
  >,
): string {
  const qualifiers = record.modifiers.map(toQualifier)

  const attributes: Lang['attribute'][] = record.attributes.map((attr) => {
    assert(attr.value, 'At this point ')

    // Event-type attribute
    if (attr.value.type === 'event') {
      const value = attr.value as { type: 'event'; datetime: Date | string }
      return {
        atom: 'attribute',
        specific_snomed_concept: {
          atom: 'snomed_concept',
          name: attr.specific_snomed_concept_name,
          category: attr.specific_snomed_concept_category,
        },
        value: {
          atom: 'event' as const,
          datetime: isDate(value.datetime) ? value.datetime.toISOString() : value.datetime,
          location: null,
        },
      }
    }
    // Regular attribute (snomed concept value or null)
    return {
      atom: 'attribute',
      specific_snomed_concept: {
        atom: 'snomed_concept',
        name: attr.specific_snomed_concept_name,
        category: attr.specific_snomed_concept_category,
      },
      value: toSnomedConcept(attr.value),
    }
  })

  const root_snomed_concept = {
    atom: 'snomed_concept' as const,
    name: record.root_snomed_concept_name,
    category: record.root_snomed_concept_category,
  }
  const specific_snomed_concept = {
    atom: 'snomed_concept' as const,
    name: record.specific_snomed_concept_name,
    category: record.specific_snomed_concept_category,
  }
  const value_snomed_concept = record.value?.type === 'snomed_concept' ? toSnomedConcept(record.value) : null

  return inverseSExpression(asNode())

  function asNode(): Lang['finding'] | Lang['evaluation'] | Lang['procedure'] {
    switch (record.type) {
      case 'finding': {
        return {
          atom: 'finding',
          root_snomed_concept,
          specific_snomed_concept,
          value_snomed_concept,
          qualifiers,
          attributes,
          exact: false,
        }
      }
      case 'evaluation': {
        return {
          atom: 'evaluation',
          root_snomed_concept,
          specific_snomed_concept,
          value_snomed_concept,
          evaluates: null,
          qualifiers,
          attributes,
        }
      }
      case 'procedure': {
        const value = !record.value ? null : record.value.type === 's_expression' ? parseExpressionExpectingAtom(record.value.s_expression, 'finding') : (
          assert(record.value.type === 'link'), {
            atom: 'link' as const,
            ...record.value,
          }
        )
        return {
          atom: 'procedure',
          root_snomed_concept,
          specific_snomed_concept,
          qualifiers,
          attributes,
          value,
        }
      }
      default: {
        throw new Error(`X ${record.type}`)
      }
    }
  }
}
