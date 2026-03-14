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
import capitalize from '../util/capitalize.ts'
import isString from '../util/isString.ts'
import { MEASUREMENT_FINDING } from './snomed_concepts.ts'
import { SnomedCategory } from '../db.d.ts'
import last from '../util/last.ts'
import words from '../util/words.ts'
import { exists } from '../util/exists.ts'

type DisplayableRecord = IntermediateBaseRecord & {
  qualifiers?: DisplayableRecord[]
}

type FormattableRecord = DisplayableRecord & {
  evaluations: DisplayableRecord[]
  destination_relations: Array<DisplayableRecord & { relation_name: string }>
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

function qualifierToDisplayableRecord(
  qualifier: Lang['qualifier'],
): DisplayableRecord {
  return {
    id: '',
    created_at: '',
    patient_encounter_id: '',
    root_snomed_concept_id: '',
    root_snomed_concept_name: 'Qualifier value',
    root_snomed_concept_category: 'qualifier value' as const,
    specific_snomed_concept_id: '',
    specific_snomed_concept_name: qualifier.specific_snomed_concept.name,
    specific_snomed_concept_category: qualifier.specific_snomed_concept.category,
    value: null,
    qualifiers: qualifier.qualifiers.map(qualifierToDisplayableRecord),
  }
}

function attributeToDisplayableRecord(
  attribute: Lang['attribute'],
): DisplayableRecord {
  return {
    id: '',
    created_at: '',
    patient_encounter_id: '',
    root_snomed_concept_id: '',
    root_snomed_concept_name: 'Attribute',
    root_snomed_concept_category: 'attribute' as const,
    specific_snomed_concept_id: '',
    specific_snomed_concept_name: attribute.specific_snomed_concept.name,
    specific_snomed_concept_category: attribute.specific_snomed_concept.category,
    value: attribute.value.atom === 'snomed_concept'
      ? {
        type: 'snomed_concept',
        ...toRenderedSnomedConcept(attribute.value),
      }
      : {
        type: 'event',
        datetime: attribute.value.datetime,
        // location: attribute.value.location,
      },
  }
}

function findingToDisplayableRecord(
  finding: Lang['finding'],
): FormattableRecord {
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
    qualifiers: [
      ...finding.qualifiers.map(qualifierToDisplayableRecord),
      ...finding.attributes.map(attributeToDisplayableRecord),
    ],
    evaluations: [],
    destination_relations: [],
  }
}

function measurementToDisplayableRecord(
  measurement: Lang['measurement'],
): FormattableRecord {
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
    evaluations: [],
    destination_relations: [],
  }
}

export function toDisplayableRecord(node: Lang['measurement' | 'finding']): FormattableRecord {
  switch (node.atom) {
    case 'finding':
      return findingToDisplayableRecord(node)
    case 'measurement':
      return measurementToDisplayableRecord(node)
  }
}

function snomedConceptDisplay(name: string): string {
  return name
    .replace(' (severity modifier)', '') // Oddly SNOMED puts (severity modifier) in _on top of_ (qualifier value)
    .replace(' (contextual qualifier)', '')
    .replace(/^Finding of (.+)/, '$1')
}

function valueDisplay(
  value: Exclude<NonNullable<WithProperRecordValue<DisplayableRecord>['value']>, string>,
): null | string | RecordValueLink {
  switch (value.type) {
    case 'event':
      return formatEventDatetime(value.datetime)
    case 'snomed_concept':
      return snomedConceptDisplay(value.name)
    case 'measurement':
      return measurementValueDisplay(value)
    case 'score':
      return value.score
    case 'link': {
      return value
    }
    case 's_expression': {
      return null
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

function isConnectingWord(word: string): boolean {
  switch (word.toLowerCase()) {
    case 'to':
    case 'for':
    case 'with':
      return true
    default:
      return false
  }
}

// In English, certain words connect things at the end
function qualifierIsPostfix(qualifier: Maybe<DisplayableRecord>): boolean {
  if (!qualifier) return false
  return isConnectingWord(qualifier.specific_snomed_concept_name)
}

function massageSpecificConceptDisplay(record: DisplayableRecord): string | null {
  if (!record.specific_snomed_concept_name) return null

  const replaced = snomedConceptDisplay(record.specific_snomed_concept_name)

  if (record.value?.type !== 'measurement') return replaced

  return replaced
    .replace(/^Body /, '')
    .replace(/, function$/, '')
}

function buildDisplays(
  record: WithProperRecordValue<DisplayableRecord> & {
    attributes?: Array<WithProperRecordValue<DisplayableRecord> & { displays: RecordDisplays }>
  },
  postfix?: boolean,
): RecordDisplays {
  const {
    qualifiers = [],
  } = record

  // assert(qualifiers.length <= 1, 'qualifiers.length <= 1')
  for (const qualifier of qualifiers) {
    assert(
      !qualifier.value,
      `Expected only prefixes (without value) saw ${humanReadableJson(qualifier)}`,
    )
  }

  const finding_sites = (record.attributes || [])
    .filter((attribute) => attribute.specific_snomed_concept_name === 'Finding site')
    .map((finding_site) => `(${exists(finding_site.displays.value)})`)

  const qualifier_is_postfix = postfix || qualifierIsPostfix(qualifiers[0])

  const qualifier_displays = qualifiers.map((prefix) => buildDisplays(prefix, qualifier_is_postfix).full)

  const specific_concept_display = massageSpecificConceptDisplay(record)
  const specific_concept_display_capitalized = specific_concept_display && capitalize(specific_concept_display, { just_first: true })

  const maybe_root_concept_name = includeRootSnomedConceptName(record) ? snomedConceptDisplay(record.root_snomed_concept_name) : null
  const root_concept_first = maybe_root_concept_name && isConnectingWord(last(words(maybe_root_concept_name))!)

  const finding_displays = compact(
    root_concept_first ? [maybe_root_concept_name, specific_concept_display_capitalized] : [specific_concept_display_capitalized, maybe_root_concept_name],
  )

  const finding_displays_qualified = qualifier_is_postfix
    ? [...finding_displays, ...qualifier_displays, ...finding_sites]
    : [...qualifier_displays, ...finding_displays, ...finding_sites]

  const finding_display = finding_displays_qualified.join(' ')

  const value = record.value ? valueDisplay(record.value) : null

  if (!value) {
    return {
      value: null,
      finding: finding_display,
      full: finding_display,
    }
  }

  return {
    finding: finding_display,
    value,
    full: `${finding_display}: ${isString(value) ? value : value.title}`,
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

export function divideQualifiersAndAddDisplay<
  DR extends DisplayableRecord,
>(record: DR): Omit<WithProperRecordValue<DR>, 'qualifiers'> & {
  displays: RecordDisplays
  modifiers: IntermediateBaseRecord[]
  attributes: RenderedAttribute[]
} {
  const qualifiers = record.qualifiers || []

  const [modifiers, unformatted_attributes] = partition(
    qualifiers || [],
    (qualifier) => qualifier.root_snomed_concept_name === 'Qualifier value',
  )

  const attributes = unformatted_attributes.map(addDisplay)
  assertAll(attributes, (attribute): asserts attribute is RenderedAttribute => {
    if (attribute.value) {
      assertOneOf(attribute.value.type, [
        'event' as const,
        'snomed_concept' as const,
      ])
    }
  })

  return {
    ...addDisplay({ ...record, qualifiers: modifiers, attributes }),
    modifiers,
    attributes,
  }
}

export function formatRecord<
  DR extends FormattableRecord,
>(record: DR): Omit<WithProperRecordValue<DR>, 'qualifiers'> & {
  displays: RecordDisplays
  modifiers: IntermediateBaseRecord[]
  attributes: RenderedAttribute[]
  evaluations: RenderedEvaluation[]
  destination_relations: Array<
    DR['destination_relations'][number] & {
      displays: RecordDisplays
    }
  >
} {
  const evaluations = record.evaluations.map(divideQualifiersAndAddDisplay)
  const destination_relations = record.destination_relations.map(divideQualifiersAndAddDisplay).map((destination_relation) => ({
    ...destination_relation,
    relation_name: snomedConceptDisplay(destination_relation.relation_name),
  }))

  return {
    ...divideQualifiersAndAddDisplay(record),
    evaluations,
    destination_relations,
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
        assert('existence' in record, "'existence' in record")
        assertOneOf(record.existence, ['Yes' as const, 'No' as const, 'Unknown' as const])
        return {
          atom: 'finding',
          root_snomed_concept,
          specific_snomed_concept,
          value_snomed_concept,
          qualifiers,
          attributes,
          exact: false,
          history: false,
          existence: record.existence,
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
        assert(record.value?.type !== 's_expression', 'Revisit this whole idea')
        const value = !record.value ? null : (
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
