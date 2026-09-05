import { z } from 'zod'
import { type Decimal } from '../util/decimal.ts'
import * as validators from '../util/validators.ts'
import compact from '../util/compact.ts'
import partition from '../util/partition.ts'
import { assertArrayEmpty } from '../util/arraySize.ts'
import { assert } from 'std/assert/assert.ts'
import { isAtom, Units, UNITS_ARRAY } from './s_expression.ts'
import { asExistence } from './existence.ts'
import { AgeDetermination, Coordinates, Existence, Maybe, NonNullableProperty } from '../types.ts'
import { snomed_category } from '../util/validators.ts'
import { SnomedCategory, WarningSignPriority } from '../db.d.ts'
import {
  ALLERGIC_CONDITION,
  ATTRIBUTE,
  CAUSATIVE_AGENT,
  CLINICAL_FINDING,
  EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS,
  EVENT,
  MEASUREMENT_PROCEDURE,
  NO_QUALIFIER,
  PATIENT_MANAGEMENT_PROCEDURE,
  PROCEDURE,
  TIME_OF_ONSET,
} from './snomed_concepts.ts'

export type Comparisons = '>' | '<' | '>=' | '<=' | '='

export type SnomedConcept = {
  name: string
  category: SnomedCategory
}

type Duration = {
  value: number
  units: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
}

export type EventValue = {
  atom: 'event'
  datetime: string
  location: Coordinates | null
}

type NonQueryableBaseLang = {
  snomed_concept: SnomedConcept
  link: {
    title: string
    href: string
    thumbnail_href: string | null
  }
  excluding: {
    finding: Lang['finding' | 'measurement']
  }
  evaluates: {
    expression: QueryableSingleNode
  }

  time_ago: Duration
  // Only ever appears inside a comparison, never as a standalone query
  timestamp_of_event: {
    atom: 'timestamp_of_event'
    event_snomed_concept: Lang['snomed_concept']
    subject: (InsertableFinding & { atom: 'finding' }) | Lang['active_condition']
  }

  // Represents a task rule definition. Its procedure is what is to be done
  task: {
    description: string
    ages: AgeDetermination[]
    due_to: QueryableEvidenceNode
    to_be_done: ToBeDone
  }
  system_priority_evaluation: {
    description: string
    ages: AgeDetermination[]
    due_to: QueryableEvidenceNode
    priority: WarningSignPriority
  }
  system_diagnosis_rule: {
    description: string
    ages: AgeDetermination[]
    due_to: QueryableEvidenceNode
    diagnosis: Lang['diagnosis']
  }
}

type QueryableMultiBaseLang = {
  not: {
    expression: QueryableEvidenceNode
  }
  and: {
    expressions: QueryableEvidenceNode[]
  }
  any2: {
    expressions: QueryableEvidenceNode[]
  }
  or: {
    expressions: QueryableEvidenceNode[]
  }
}

type QueryableSingleBaseLang =
  & {
    finding: {
      root_snomed_concept: Lang['snomed_concept'] | null
      specific_snomed_concept: Lang['snomed_concept'] | null
      value_snomed_concept: Lang['snomed_concept'] | null
      qualifiers: Lang['qualifier'][]
      attributes: Lang['attribute'][]
      excluding: Lang['excluding'][]
      exact: boolean
      history: boolean
      existence: Existence | 'Any'
    }
    procedure: {
      root_snomed_concept: Lang['snomed_concept'] | null
      specific_snomed_concept: Lang['snomed_concept'] | null
      value:
        | null
        | Lang['snomed_concept']
        | Lang['link']
        | Lang['measurement'][]
        | MatchingFinding[]
      qualifiers: Lang['qualifier'][]
      attributes: Lang['attribute'][]
      permissions?: Array<{
        type: 'done_by' | 'approved_by'
        role: 'doctor' | 'nurse' | 'specialist' | 'shcp'
        specialty?: string
      }>
      history: boolean
    }
    evaluation: {
      root_snomed_concept: Lang['snomed_concept'] | null
      specific_snomed_concept: Lang['snomed_concept'] | null
      value_snomed_concept: Lang['snomed_concept'] | null
      evaluates: null | Lang['evaluates']
      qualifiers: Lang['qualifier'][]
      attributes: Lang['attribute'][]
      history: boolean
    }
    attribute: {
      root_snomed_concept: Lang['snomed_concept']
      specific_snomed_concept: Lang['snomed_concept']
      value: Lang['snomed_concept'] | EventValue
    }
    qualifier: {
      specific_snomed_concept: Lang['snomed_concept']
      qualifiers: Lang['qualifier'][]
    }
    diagnosis: {
      snomed_concept: Lang['snomed_concept']
      certainty_qualifier: 'definite' | 'probable' | 'equivocal' | 'possible' | 'improbable'
    }
    measurement: {
      snomed_concept: Lang['snomed_concept']
      units: Units
      history: false
    }
    active_condition: {
      snomed_concept: Lang['snomed_concept']
      possible: boolean
    }
  }
  & {
    [Comp in Comparisons]:
      | {
        type: 'measurement'
        measurement: Lang['measurement']
        value: Decimal
      }
      | {
        type: 'event_time_comparison'
        timestamp_of_event: Lang['timestamp_of_event']
        duration: Duration
      }
  }

export type MeasurementComparison = Lang[Comparisons] & { type: 'measurement' }

export type EventTimeComparison = Lang[Comparisons] & { type: 'event_time_comparison' }

type BaseLang = NonQueryableBaseLang & QueryableSingleBaseLang & QueryableMultiBaseLang

export type Lang = {
  [Atom in keyof BaseLang]: {
    atom: Atom
  } & BaseLang[Atom]
}

export type AnyNode = Lang[keyof Lang]

export type QueryableSingleNode = Lang[keyof QueryableSingleBaseLang] | Lang['or' | 'and']

export type QueryableEvidenceNode = QueryableSingleNode | Lang[keyof QueryableMultiBaseLang]

export type InsertableFindingBase = NonNullableProperty<Lang['finding'], 'root_snomed_concept' | 'specific_snomed_concept'> & {
  existence: Existence
}

// A timestamp_of_event whose subject can be inserted as a finding, as when a
// check_for is answered. Query contexts (due_to) may instead use an
// active_condition subject, which is only ever matched, never inserted.
export type InsertableTimestampOfEvent = Lang['timestamp_of_event'] & {
  subject: InsertableFinding & { atom: 'finding' }
}

export type InsertableEventTimeComparison = EventTimeComparison & {
  timestamp_of_event: InsertableTimestampOfEvent
}

export type MatchingFinding = Omit<InsertableFindingBase, 'existence'> & { existence: 'Any' }

export type InsertableFinding = InsertableFindingBase | MeasurementComparison

export type ToBeDone = NonNullableProperty<Lang['procedure'], 'root_snomed_concept' | 'specific_snomed_concept' | 'value'>

export type ToBeDoneProcedureLink = ToBeDone & { value: Lang['link'] }
export type ToBeDoneProcedureProcedure = ToBeDone & { value: Lang['snomed_concept'] }
export type ToBeDoneProcedureCheckFor = ToBeDone & { value: Lang['finding'][] }
export type ToBeDoneProcedureMeasurements = ToBeDone & { value: Lang['measurement'][] }

export type SnomedConceptAttribute = Lang['attribute'] & { value: { atom: 'snomed_concept' } }

const snomed_concept: z.ZodType<Lang['snomed_concept']> = z
  .object({
    atom: z.literal('snomed_concept'),
    args: z.tuple([z.string(), snomed_category]),
  }).transform(({ atom, args: [name, category] }) => ({
    atom,
    name,
    category,
  }))
  .describe('snomed_concept')

function isSnomedConcept(node: Maybe<AnyNode>): node is Lang['snomed_concept'] {
  return !!node && isAtom(node, 'snomed_concept')
}

export const qualifier: z.ZodType<Lang['qualifier']> = z.lazy(() =>
  z.object({
    atom: z.literal('qualifier'),
    args: z.tuple([
      snomed_concept,
      qualifier.optional(),
      qualifier.optional(),
      qualifier.optional(),
      qualifier.optional(),
      qualifier.optional(),
      qualifier.optional(),
    ])
      .transform(
        ([specific_snomed_concept, ...rest]) => {
          const nodes = compact(rest)

          return {
            specific_snomed_concept,
            qualifiers: nodes,
          }
        },
      ),
  }).transform(({ atom, args }) => ({
    atom,
    ...args,
  }))
).describe('qualifier')

const attribute_or_qualifier: z.ZodType<
  Lang['attribute'] | Lang['qualifier']
> = z.lazy(() =>
  z.union([
    attribute,
    event,
    qualifier,
  ])
).describe('attribute | qualifier')

const snomed_concept_or_attribute_or_qualifier: z.ZodType<
  | Lang['snomed_concept']
  | Lang['attribute']
  | Lang['qualifier']
> = z.lazy(() =>
  z.union([
    snomed_concept,
    attribute_or_qualifier,
  ])
).describe('snomed_concept_id | attribute | qualifier')

const attribute_or_qualifier_or_excluding: z.ZodType<
  | Lang['attribute']
  | Lang['qualifier']
  | Lang['excluding']
> = z.lazy(() =>
  z.union([
    attribute_or_qualifier,
    excluding,
  ])
).describe('snomed_concept_id | attribute | qualifier | excluding')

const snomed_concept_or_attribute_or_qualifier_or_excluding: z.ZodType<
  | Lang['snomed_concept']
  | Lang['attribute']
  | Lang['qualifier']
  | Lang['excluding']
> = z.lazy(() =>
  z.union([
    snomed_concept_or_attribute_or_qualifier,
    excluding,
  ])
).describe('snomed_concept_id | attribute | qualifier | excluding')

function isQualifier(node: AnyNode): node is Lang['qualifier'] {
  return node.atom === 'qualifier'
}

function isAttribute(node: AnyNode): node is Lang['attribute'] {
  return node.atom === 'attribute'
}

function isExcluding(node: AnyNode): node is Lang['excluding'] {
  return node.atom === 'excluding'
}

export const finding_base: z.ZodType<Lang['finding']> = z.lazy(() =>
  z.object({
    atom: z.literal('finding'),
    args: z.tuple([
      snomed_concept_or_attribute_or_qualifier_or_excluding.optional(),
      snomed_concept_or_attribute_or_qualifier_or_excluding.optional(),
      snomed_concept_or_attribute_or_qualifier_or_excluding.optional(),
      attribute_or_qualifier_or_excluding.optional(),
      attribute_or_qualifier_or_excluding.optional(),
      attribute_or_qualifier_or_excluding.optional(),
      attribute_or_qualifier_or_excluding.optional(),
      attribute_or_qualifier_or_excluding.optional(),
      attribute_or_qualifier_or_excluding.optional(),
      attribute_or_qualifier_or_excluding.optional(),
      attribute_or_qualifier_or_excluding.optional(),
      attribute_or_qualifier_or_excluding.optional(),
    ]),
  }).transform(
    (
      {
        atom,
        args: [
          root_snomed_concept = null,
          specific_snomed_concept = null,
          value_snomed_concept = null,
          ...rest
        ],
      },
    ) => {
      const nodes = compact(rest)

      if (value_snomed_concept && !isSnomedConcept(value_snomed_concept)) {
        nodes.unshift(value_snomed_concept)
        value_snomed_concept = null
      }

      if (
        specific_snomed_concept && !isSnomedConcept(specific_snomed_concept)
      ) {
        assert(!isSnomedConcept(value_snomed_concept))
        nodes.unshift(specific_snomed_concept)
        specific_snomed_concept = null
      }

      if (root_snomed_concept && !isSnomedConcept(root_snomed_concept)) {
        assert(!isSnomedConcept(value_snomed_concept))
        assert(!isSnomedConcept(specific_snomed_concept))
        nodes.unshift(root_snomed_concept)
        root_snomed_concept = null
      }

      const [qualifiers, non_qualifiers] = partition(nodes, isQualifier)
      const [attributes, non_attributes] = partition(non_qualifiers, isAttribute)
      const [excluding, unmatched] = partition(non_attributes, isExcluding)
      assert(!unmatched.length, 'Only one excluding clause supported')

      return {
        atom,
        root_snomed_concept,
        specific_snomed_concept,
        value_snomed_concept,
        qualifiers,
        attributes,
        excluding,
        exact: false,
        history: false,
        existence: asExistence(value_snomed_concept),
      }
    },
  )
).describe('finding_base')

// TODO: this or this or that approach makes the error messages super hard to read
// Perhaps we look and see what the person put there and then try parsing with that
export const clinical_finding: z.ZodType<NonNullableProperty<Lang['finding'], 'root_snomed_concept'>> = z.lazy(() =>
  z.object({
    atom: z.literal('clinical_finding'),
    args: z.tuple([
      snomed_concept_or_attribute_or_qualifier_or_excluding.optional(),
      snomed_concept_or_attribute_or_qualifier_or_excluding.optional(),
      attribute_or_qualifier_or_excluding.optional(),
      attribute_or_qualifier_or_excluding.optional(),
      attribute_or_qualifier_or_excluding.optional(),
      attribute_or_qualifier_or_excluding.optional(),
      attribute_or_qualifier_or_excluding.optional(),
      attribute_or_qualifier_or_excluding.optional(),
    ]),
  }).transform(
    (
      {
        args: [
          specific_snomed_concept = null,
          value_snomed_concept = null,
          ...rest
        ],
      },
    ) => {
      const nodes = compact(rest)

      if (value_snomed_concept && !isSnomedConcept(value_snomed_concept)) {
        nodes.unshift(value_snomed_concept)
        value_snomed_concept = null
      }

      if (
        specific_snomed_concept && !isSnomedConcept(specific_snomed_concept)
      ) {
        assert(!isSnomedConcept(value_snomed_concept))
        nodes.unshift(specific_snomed_concept)
        specific_snomed_concept = null
      }

      const [qualifiers, non_qualifiers] = partition(nodes, isQualifier)
      const [attributes, non_attributes] = partition(non_qualifiers, isAttribute)
      const [excluding, unmatched] = partition(non_attributes, isExcluding)
      assert(!unmatched.length, 'Only one excluding clause supported')

      return {
        atom: 'finding' as const,
        root_snomed_concept: {
          atom: 'snomed_concept' as const,
          name: CLINICAL_FINDING.name,
          category: CLINICAL_FINDING.category,
        },
        specific_snomed_concept,
        value_snomed_concept,
        qualifiers,
        attributes,
        excluding,
        exact: false,
        history: false,
        existence: asExistence(value_snomed_concept),
      }
    },
  )
).describe('clinical_finding')

export const positive_finding: z.ZodType<Lang['finding']> = z.lazy(() => finding_base.or(clinical_finding).or(allergy).or(history_finding)).describe(
  'positive_finding',
)

export const finding: z.ZodType<Lang['finding']> = z.lazy(() => positive_finding.or(no_finding)).describe('finding')

export const no_finding: z.ZodType<Lang['finding']> = z.lazy(() =>
  z.object({
    atom: z.literal('no'),
    args: z.tuple([positive_finding]),
  }).transform(({ args: [finding] }) => {
    assert(!finding.value_snomed_concept, 'Attempt to overwrite value_snomed_concept with (no)')
    return {
      ...finding,
      value_snomed_concept: {
        atom: 'snomed_concept' as const,
        ...NO_QUALIFIER,
      },
      existence: 'No' as const,
    }
  })
).describe('no_finding')

const time_unit = z.enum([
  'seconds',
  'minutes',
  'hours',
  'days',
  'weeks',
  'months',
  'years',
])

export const time_ago: z.ZodType<Lang['time_ago']> = z.lazy(() =>
  z.object({
    atom: z.literal('time_ago'),
    args: z.tuple([validators.positive_integer, time_unit]),
  }).transform(({ atom, args: [value, units] }) => ({ atom, value, units }))
).describe('time_ago')

export const insertable_finding_base: z.ZodType<InsertableFindingBase> = z.lazy(() => finding)
  .refine(
    (finding) => finding.root_snomed_concept != null,
    {
      message: 'root_snomed_concept is required for an insertable finding',
      path: ['args'],
    },
  )
  .refine(
    (finding) => finding.specific_snomed_concept != null,
    {
      message: 'specific_snomed_concept is required for an insertable finding',
      path: ['args'],
    },
  ).refine(
    (finding) => finding.existence !== 'Any',
    {
      message: 'existence cannot be "Any" for an insertable finding, that only makes sense in the context of a query',
      path: ['args'],
    },
  )
  // .refine doesn't do type winnowing
  .transform((finding) => finding as InsertableFindingBase)
  .describe('insertable_finding_base')

export const evaluates: z.ZodType<Lang['evaluates']> = z.lazy(() =>
  z.object({
    atom: z.literal('evaluates'),
    args: z.tuple([any_query_single]),
  }).transform(({ atom, args: [expression] }) => ({
    atom,
    expression,
  }))
).describe('evaluates')

const attribute_or_qualifier_or_evaluates: z.ZodType<
  Lang['attribute'] | Lang['qualifier'] | Lang['evaluates']
> = z.lazy(() =>
  z.union([
    attribute_or_qualifier,
    evaluates,
  ])
).describe('attribute | qualifier | evaluates')

const snomed_concept_or_attribute_or_qualifier_or_evaluates: z.ZodType<
  | Lang['snomed_concept']
  | Lang['attribute']
  | Lang['qualifier']
  | Lang['evaluates']
> = z.lazy(() =>
  z.union([
    snomed_concept,
    attribute_or_qualifier_or_evaluates,
  ])
).describe('snomed_concept | attribute | qualifier | evaluates')

function isEvaluates(node: AnyNode): node is Lang['evaluates'] {
  return node.atom === 'evaluates'
}

export const evaluation: z.ZodType<Lang['evaluation']> = z.lazy(() =>
  z.object({
    atom: z.literal('evaluation'),
    args: z.tuple([
      snomed_concept_or_attribute_or_qualifier_or_evaluates.optional(),
      snomed_concept_or_attribute_or_qualifier_or_evaluates.optional(),
      snomed_concept_or_attribute_or_qualifier_or_evaluates.optional(),
      attribute_or_qualifier_or_evaluates.optional(),
      attribute_or_qualifier_or_evaluates.optional(),
      attribute_or_qualifier_or_evaluates.optional(),
      attribute_or_qualifier_or_evaluates.optional(),
      attribute_or_qualifier_or_evaluates.optional(),
    ]),
  }).transform(
    (
      {
        atom,
        args: [
          root_snomed_concept = null,
          specific_snomed_concept = null,
          value_snomed_concept = null,
          ...rest
        ],
      },
    ) => {
      const nodes = compact(rest)

      if (value_snomed_concept && !isSnomedConcept(value_snomed_concept)) {
        nodes.unshift(value_snomed_concept)
        value_snomed_concept = null
      }

      if (
        specific_snomed_concept && !isSnomedConcept(specific_snomed_concept)
      ) {
        assert(!isSnomedConcept(value_snomed_concept))
        nodes.unshift(specific_snomed_concept)
        specific_snomed_concept = null
      }

      if (root_snomed_concept && !isSnomedConcept(root_snomed_concept)) {
        assert(!isSnomedConcept(value_snomed_concept))
        assert(!isSnomedConcept(specific_snomed_concept))
        nodes.unshift(root_snomed_concept)
        root_snomed_concept = null
      }

      const [qualifiers, others1] = partition(nodes, isQualifier)
      const [attributes, others2] = partition(others1, isAttribute)
      const [evaluates = null, ...more_evaluates] = others2.filter(isEvaluates)

      assertArrayEmpty(more_evaluates)

      return {
        atom,
        root_snomed_concept,
        specific_snomed_concept,
        value_snomed_concept,
        qualifiers,
        evaluates,
        attributes,
        history: false,
      }
    },
  )
).describe('evaluation')

const attribute_base: z.ZodType<Lang['attribute']> = z.lazy(() =>
  z.object({
    atom: z.literal('attribute'),
    args: z.tuple([snomed_concept, snomed_concept, snomed_concept.optional()]),
  }).transform((
    { atom, args: [root_snomed_concept, specific_snomed_concept, value] },
  ) => {
    // If only 2 concepts are provided these are the specific/value snomed concepts so we shift
    if (!value) {
      return {
        atom,
        root_snomed_concept: {
          atom: 'snomed_concept' as const,
          name: ATTRIBUTE.name,
          category: ATTRIBUTE.category,
        },
        specific_snomed_concept: root_snomed_concept,
        value: specific_snomed_concept,
      }
    }
    return {
      atom,
      root_snomed_concept,
      specific_snomed_concept,
      value,
    }
  })
).describe('attribute_base')

const excluding: z.ZodType<Lang['excluding']> = z.lazy(() =>
  z.object({
    atom: z.literal('excluding'),
    args: z.tuple([finding.or(measurement)]),
  }).transform((
    { args: [finding] },
  ) => ({
    atom: 'excluding' as const,
    finding,
  }))
).describe('excluding')

const finding_site: z.ZodType<Lang['attribute']> = z.lazy(() =>
  z.object({
    atom: z.literal('finding_site'),
    args: z.tuple([snomed_concept]),
  }).transform((
    { args: [value] },
  ) => ({
    atom: 'attribute' as const,
    root_snomed_concept: {
      atom: 'snomed_concept' as const,
      name: ATTRIBUTE.name,
      category: ATTRIBUTE.category,
    },
    specific_snomed_concept: {
      atom: 'snomed_concept' as const,
      name: 'Finding site',
      category: 'attribute' as const,
    },
    value,
  }))
).describe('finding_site')

export const event: z.ZodType<Lang['attribute']> = z.lazy(() =>
  z.object({
    atom: z.literal('event'),
    args: z.tuple([snomed_concept, z.string()]),
  }).transform(({ args: [specific_snomed_concept, datetime] }) => ({
    atom: 'attribute' as const,
    root_snomed_concept: {
      atom: 'snomed_concept' as const,
      name: EVENT.name,
      category: EVENT.category,
    },
    specific_snomed_concept,
    value: { atom: 'event' as const, datetime, location: null },
  }))
).describe('event')

const timestamp_of_event_subject = z.lazy(() => insertable_finding_base.or(active_condition))

export const timestamp_of_event_base: z.ZodType<Lang['timestamp_of_event']> = z.lazy(() =>
  z.object({
    atom: z.literal('timestamp_of_event'),
    args: z.tuple([snomed_concept, timestamp_of_event_subject]),
  }).transform(({ args: [event_snomed_concept, subject] }) => ({
    atom: 'timestamp_of_event' as const,
    event_snomed_concept,
    subject,
  }))
).describe('timestamp_of_event_base')

export const onset: z.ZodType<Lang['timestamp_of_event']> = z.lazy(() =>
  z.object({
    atom: z.literal('onset'),
    args: z.tuple([timestamp_of_event_subject]),
  }).transform(({ args: [subject] }) => ({
    atom: 'timestamp_of_event' as const,
    event_snomed_concept: {
      atom: 'snomed_concept' as const,
      name: TIME_OF_ONSET.name,
      category: TIME_OF_ONSET.category,
    },
    subject,
  }))
).describe('onset')

export const timestamp_of_event: z.ZodType<Lang['timestamp_of_event']> = z.lazy(() => z.union([timestamp_of_event_base, onset])).describe('timestamp_of_event')

export const insertable_timestamp_of_event: z.ZodType<InsertableTimestampOfEvent> = z.lazy(() =>
  timestamp_of_event
    .refine(
      (node) => node.subject.atom === 'finding',
      {
        message: 'the subject of an insertable timestamp_of_event must be a finding, not an active_condition',
        path: ['args'],
      },
    )
    // .refine doesn't do type winnowing
    .transform((node) => node as InsertableTimestampOfEvent)
).describe('insertable_timestamp_of_event')

export const attribute: z.ZodType<Lang['attribute']> = z.lazy(() => z.union([attribute_base, finding_site, event])).describe('attribute')

export const measurement: z.ZodType<Lang['measurement']> = z.lazy(() =>
  z.object({
    atom: z.literal('measurement'),
    args: z.tuple([snomed_concept, z.enum(UNITS_ARRAY)]),
  }).transform(({ atom, args: [snomed_concept, units] }) => ({
    atom,
    snomed_concept,
    units,
    history: false as const,
  }))
).describe('measurement')

export const active_condition: z.ZodType<Lang['active_condition']> = z.lazy(
  () =>
    z.object({
      atom: z.literal('active_condition'),
      args: z.tuple([snomed_concept, z.literal('possible').optional()]),
    }).transform(({ atom, args: [snomed_concept, possible] }) => ({
      atom,
      snomed_concept,
      possible: !!possible,
    })),
).describe('active_condition')

export const allergy: z.ZodType<InsertableFindingBase & { history: true }> = z.lazy(
  () =>
    z.object({
      atom: z.literal('allergy'),
      args: z.tuple([snomed_concept.optional()]),
    }).transform(({ args: [snomed_concept] }) => ({
      atom: 'finding' as const,
      root_snomed_concept: {
        atom: 'snomed_concept' as const,
        name: CLINICAL_FINDING.name,
        category: CLINICAL_FINDING.category,
      },
      specific_snomed_concept: {
        atom: 'snomed_concept' as const,
        name: ALLERGIC_CONDITION.name,
        category: ALLERGIC_CONDITION.category,
      },
      value_snomed_concept: null,
      excluding: [],
      qualifiers: [],
      attributes: snomed_concept
        ? [{
          atom: 'attribute' as const,
          root_snomed_concept: {
            atom: 'snomed_concept' as const,
            name: ATTRIBUTE.name,
            category: ATTRIBUTE.category,
          },
          specific_snomed_concept: {
            atom: 'snomed_concept' as const,
            name: CAUSATIVE_AGENT.name,
            category: CAUSATIVE_AGENT.category,
          },
          value: snomed_concept,
        }]
        : [],
      exact: false,
      history: true as const,
      existence: 'Yes' as const,
    })),
).describe('allergy')

export const procedure_base: z.ZodType<Lang['procedure']> = z.lazy(() =>
  z.object({
    atom: z.literal('procedure'),
    args: z.tuple([
      snomed_concept_or_attribute_or_qualifier.optional(),
      snomed_concept_or_attribute_or_qualifier.optional(),
      attribute_or_qualifier.or(link).optional(),
      attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
    ])
      .transform(
        (
          [
            root_snomed_concept = null,
            specific_snomed_concept = null,
            maybe_link = null,
            ...rest
          ],
        ) => {
          const nodes = compact(rest)

          if (
            specific_snomed_concept && !isSnomedConcept(specific_snomed_concept)
          ) {
            nodes.unshift(specific_snomed_concept)
            specific_snomed_concept = null
          }

          if (root_snomed_concept && !isSnomedConcept(root_snomed_concept)) {
            assert(!isSnomedConcept(specific_snomed_concept))
            nodes.unshift(root_snomed_concept)
            root_snomed_concept = null
          }

          if (maybe_link && (maybe_link.atom !== 'link')) {
            assert(maybe_link.atom === 'attribute' || maybe_link.atom === 'qualifier')
            nodes.unshift(maybe_link)
            maybe_link = null
          }

          const [qualifiers, attributes] = partition(nodes, isQualifier)

          return {
            root_snomed_concept,
            specific_snomed_concept,
            qualifiers,
            attributes,
            value: maybe_link,
            history: false,
          }
        },
      ),
  }).transform(({ atom, args }) => ({
    atom,
    ...args,
  }))
).describe('procedure_base')

const can_check_for = z.lazy(() => insertable_finding_base)

export const check_for: z.ZodType<Lang['procedure']> = z.lazy(
  () =>
    z.object({
      atom: z.literal('check_for'),
      args: can_check_for.array(),
    }).transform(({ args: check_for }) => ({
      atom: 'procedure' as const,
      root_snomed_concept: {
        atom: 'snomed_concept' as const,
        ...PROCEDURE,
      },
      specific_snomed_concept: {
        atom: 'snomed_concept' as const,
        ...EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS,
      },
      qualifiers: [],
      attributes: [],
      history: false,
      value: check_for.map((node) => ({
        ...node,
        existence: 'Any' as const,
      })),
    })),
).describe('check_for')

export const measure: z.ZodType<Lang['procedure']> = z.lazy(
  () =>
    z.object({
      atom: z.literal('measure'),
      args: measurement.array(),
    }).transform(({ args: measurement_nodes }) => ({
      atom: 'procedure' as const,
      root_snomed_concept: {
        atom: 'snomed_concept' as const,
        ...PROCEDURE,
      },
      specific_snomed_concept: {
        atom: 'snomed_concept' as const,
        ...MEASUREMENT_PROCEDURE,
      },
      qualifiers: [],
      attributes: [],
      history: false,
      value: measurement_nodes,
    })),
).describe('measure')

const permission_role = z.lazy(() =>
  z.object({
    atom: z.literal('role'),
    args: z.tuple([z.enum(['doctor', 'nurse', 'specialist', 'shcp'])]),
  }).transform(({ args: [role] }) => role)
)

const permission_specialty = z.lazy(() =>
  z.object({
    atom: z.literal('specialty'),
    args: z.tuple([z.string()]),
  }).transform(({ args: [specialty] }) => specialty)
)

const permission_entry = z.lazy(() =>
  z.object({
    atom: z.literal('done_by').or(z.literal('approved_by')),
    args: z.tuple([permission_role, permission_specialty.optional()]),
  }).transform(({ atom, args: [role, specialty] }) => specialty !== undefined ? { type: atom, role, specialty } : { type: atom, role })
)

export const manage: z.ZodType<Lang['procedure']> = z.lazy(
  () =>
    z.object({
      atom: z.literal('manage'),
      args: z.tuple([snomed_concept]).rest(permission_entry),
    }).transform(({ args: [snomed_concept, ...permissions] }) => ({
      atom: 'procedure' as const,
      root_snomed_concept: {
        atom: 'snomed_concept' as const,
        ...PROCEDURE,
      },
      specific_snomed_concept: {
        atom: 'snomed_concept' as const,
        ...PATIENT_MANAGEMENT_PROCEDURE,
      },
      qualifiers: [],
      attributes: [],
      history: false,
      value: snomed_concept,
      ...(permissions.length ? { permissions } : {}),
    })),
).describe('manage')

export const procedure: z.ZodType<Lang['procedure']> = z.lazy(() =>
  procedure_base
    .or(check_for)
    .or(measure)
    .or(manage)
).describe('procedure')

export const to_be_done: z.ZodType<ToBeDone> = procedure
  .transform((procedure) => procedure as NonNullableProperty<typeof procedure, 'root_snomed_concept' | 'specific_snomed_concept' | 'value'>)
  .refine(
    (procedure) => procedure.root_snomed_concept != null,
    {
      message: 'root_snomed_concept is required for a defined clinical procedure',
      path: ['args'],
    },
  )
  .refine(
    (procedure) => procedure.specific_snomed_concept != null,
    {
      message: 'specific_snomed_concept is required for a defined clinical procedure',
      path: ['args'],
    },
  )
  .refine(
    (procedure) => procedure.value != null,
    {
      message: 'value is required for a defined clinical procedure',
      path: ['args'],
    },
  )
  .describe('to_be_done')

const comparator_operator = z.enum([
  '>',
  '<',
  '>=',
  '<=',
  '=',
])

export const measurement_comparator: z.ZodType<MeasurementComparison> = z.lazy(() =>
  z.object({
    atom: comparator_operator,
    args: z.tuple([measurement, validators.positive_decimal]),
  }).transform(({ atom, args: [measurement, value] }) => ({
    atom,
    type: 'measurement' as const,
    measurement,
    value,
  }))
).describe('measurement_comparator')

export const event_time_comparison: z.ZodType<Lang[Comparisons] & { type: 'event_time_comparison' }> = z.lazy(() =>
  z.object({
    atom: comparator_operator,
    args: z.tuple([timestamp_of_event, time_ago]),
  }).transform(({ atom, args: [timestamp_of_event, duration] }) => ({
    atom,
    type: 'event_time_comparison' as const,
    timestamp_of_event,
    duration,
  }))
).describe('event_time_comparison')

export const insertable_event_time_comparison: z.ZodType<InsertableEventTimeComparison> = z.lazy(() =>
  z.object({
    atom: comparator_operator,
    args: z.tuple([insertable_timestamp_of_event, time_ago]),
  }).transform(({ atom, args: [timestamp_of_event, duration] }) => ({
    atom,
    type: 'event_time_comparison' as const,
    timestamp_of_event,
    duration,
  }))
).describe('insertable_event_time_comparison')

export const comparator = z.lazy(() => measurement_comparator.or(event_time_comparison)).describe('comparator')

export const history_finding: z.ZodType<Lang['finding'] & { history: true }> = z.lazy(() =>
  z.object({
    atom: z.literal('history'),
    args: z.tuple([finding]),
  }).transform(({ args: [finding] }) => ({
    ...finding,
    history: true as const,
  }))
).describe('history_finding')

// export const history_evaluation: z.ZodType<Lang['evaluation'] & { history: true }> = z.lazy(() =>
//   z.object({
//     atom: z.literal('history'),
//     args: z.tuple([evaluation]),
//   }).transform(({ args: [evaluation] }) => ({
//     ...evaluation,
//     history: true as const,
//   }))
// ).describe('history_evaluation')

export const exact: z.ZodType<Lang['finding'] & { exact: true }> = z.lazy(() =>
  z.object({
    atom: z.literal('exact'),
    args: z.tuple([finding]),
  }).transform(({ args: [finding] }) => ({
    ...finding,
    exact: true as const,
  }))
).describe('exact')

export const link: z.ZodType<Lang['link']> = z.lazy(() =>
  z.object({
    atom: z.literal('link'),
    args: z.tuple([z.string(), z.string(), z.string().optional()]),
  }).transform(({ atom, args: [title, href, thumbnail_href = null] }) => ({
    atom,
    title,
    href,
    thumbnail_href,
  }))
).describe('link')

const age_determination = z.enum(['adult', 'older child', 'younger child'])
const ages = z.lazy(() =>
  z.object({
    atom: z.literal('ages'),
    args: age_determination.array(),
  }).transform(({ args }) => args)
    .or(age_determination.transform((age) => [age]))
    .or(z.literal('all_ages').transform(() => ['adult' as const, 'older child' as const, 'younger child' as const]))
).describe('ages')

export const task: z.ZodType<Lang['task']> = z.lazy(() =>
  z.object({
    atom: z.literal('task'),
    args: z.tuple([
      z.string(),
      ages,
      any_query_evidence,
      to_be_done,
    ]),
  }).transform(({ atom, args: [description, ages, due_to, to_be_done] }) => ({
    atom,
    description,
    ages,
    due_to,
    to_be_done,
  }))
).describe('task')

export const system_priority_evaluation: z.ZodType<Lang['system_priority_evaluation']> = z.lazy(() =>
  z.object({
    atom: z.literal('system_priority_evaluation'),
    args: z.tuple([
      z.string(),
      ages,
      z.enum([
        'Emergency',
        'Very urgent',
        'Urgent',
      ]),
      any_query_evidence,
    ]),
  }).transform(({ atom, args: [description, ages, priority, due_to] }) => ({
    atom,
    description,
    ages,
    priority,
    due_to,
  }))
).describe('system_priority_evaluation')

export const insertable_finding: z.ZodType<InsertableFinding> = z.lazy(() => measurement_comparator.or(insertable_finding_base)).describe(
  'insertable_finding',
)

export const not: z.ZodType<Lang['not']> = z.lazy(() =>
  z.object({
    atom: z.literal('not'),
    args: z.tuple([any_query_evidence]),
  }).transform(({ atom, args: [expression] }) => ({
    atom,
    expression,
  }))
).describe('not')

export const or: z.ZodType<Lang['or']> = z.lazy(() =>
  z.object({
    atom: z.literal('or'),
    args: z.array(any_query_evidence),
  }).transform(({ atom, args }) => ({
    atom,
    expressions: args,
  }))
).describe('or')

export const and: z.ZodType<Lang['and']> = z.lazy(() =>
  z.object({
    atom: z.literal('and'),
    args: z.array(any_query_evidence),
  }).transform(({ atom, args }) => ({
    atom,
    expressions: args,
  }))
).describe('and')

export const any2: z.ZodType<Lang['any2']> = z.lazy(() =>
  z.object({
    atom: z.literal('any2'),
    args: z.array(any_query_evidence),
  }).transform(({ atom, args }) => ({
    atom,
    expressions: args,
  }))
).describe('any2')

export const diagnosis: z.ZodType<Lang['diagnosis']> = z.lazy(() =>
  z.object({
    atom: z.literal('diagnosis'),
    args: z.tuple([
      snomed_concept,
      validators.diagnosis_certainty,
    ]),
  }).transform(({ atom, args: [snomed_concept, certainty_qualifier] }) => ({
    atom,
    certainty_qualifier,
    snomed_concept,
  }))
).describe('diagnosis')

export const system_diagnosis_rule: z.ZodType<Lang['system_diagnosis_rule']> = z.lazy(() =>
  z.object({
    atom: z.literal('system_diagnosis_rule'),
    args: z.tuple([z.string(), diagnosis, ages, any_query_evidence]),
  }).transform(({ atom, args: [description, diagnosis, ages, due_to] }) => ({
    atom,
    description,
    diagnosis,
    ages,
    due_to,
  }))
).describe('system_diagnosis_rule')

export const any_rule = z.lazy(() => task.or(system_diagnosis_rule).or(system_priority_evaluation)).describe('any_rule')

export const any_query_single: z.ZodType<QueryableSingleNode> = z.lazy(() =>
  z.union([
    event,
    finding,
    no_finding,
    evaluation,
    diagnosis,
    procedure,
    measurement,
    active_condition,
    measurement_comparator,
    event_time_comparison,
    qualifier,
    exact,
  ])
).describe('any_query_single')

export const any_query_evidence: z.ZodType<QueryableEvidenceNode> = z.lazy(() =>
  z.union([
    event,
    finding,
    evaluation,
    diagnosis,
    procedure,
    measurement,
    active_condition,
    measurement_comparator,
    event_time_comparison,
    qualifier,
    exact,
    or,
    and,
    not,
    any2,
  ])
).describe('any_query_evidence')
