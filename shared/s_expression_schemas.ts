import { z } from 'zod'
import { type Decimal } from '../util/decimal.ts'
import * as validators from '../util/validators.ts'
import compact from '../util/compact.ts'
import partition from '../util/partition.ts'
import { assertArrayEmpty } from '../util/arraySize.ts'
import { assert } from 'std/assert/assert.ts'
import { isAtom, Units, UNITS_ARRAY } from './s_expression.ts'
import { AgeDetermination, Coordinates, Existence, Maybe, NonNullableProperty, Priority } from '../types.ts'
import { snomed_category } from '../util/validators.ts'
import { SnomedCategory } from '../db.d.ts'
import {
  ALLERGIC_CONDITION,
  CAUSATIVE_AGENT,
  CLINICAL_FINDING,
  EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS,
  MEASUREMENT_PROCEDURE,
  PROCEDURE,
} from './snomed_concepts.ts'

export type Comparisons = '>' | '<' | '>=' | '<=' | '='

export type SnomedConcept = {
  name: string
  category: SnomedCategory
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
  evaluates: {
    expression: QueryableNode
  }
  task: {
    description: string
    ages: AgeDetermination[]
    due_to: QueryableNode
    procedure: Lang['procedure']
  }
  system_priority_evaluation: {
    ages: AgeDetermination[]
    due_to: QueryableNode
    priority: Priority
  }
  system_diagnosis_rule: {
    ages: AgeDetermination[]
    due_to: QueryableNode
    diagnosis: Lang['diagnosis']
  }
}

type QueryableBaseLang =
  & {
    finding: {
      root_snomed_concept: Lang['snomed_concept'] | null
      specific_snomed_concept: Lang['snomed_concept'] | null
      value_snomed_concept: Lang['snomed_concept'] | null
      qualifiers: Lang['qualifier'][]
      attributes: Lang['attribute'][]
      exact: boolean
      history: boolean
      existence: Existence | 'Any'
    }
    procedure: {
      root_snomed_concept: Lang['snomed_concept'] | null
      specific_snomed_concept: Lang['snomed_concept'] | null
      value:
        | null
        | Lang['link']
        | Lang['measurement'][]
        | Array<Omit<InsertableFindingBase, 'existence'> & { existence: 'Any' }>
      qualifiers: Lang['qualifier'][]
      attributes: Lang['attribute'][]
    }
    evaluation: {
      root_snomed_concept: Lang['snomed_concept'] | null
      specific_snomed_concept: Lang['snomed_concept'] | null
      value_snomed_concept: Lang['snomed_concept'] | null
      evaluates: null | Lang['evaluates']
      qualifiers: Lang['qualifier'][]
      attributes: Lang['attribute'][]
    }
    attribute: {
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
    }
    active_condition: {
      snomed_concept: Lang['snomed_concept']
      possible: boolean
    }
    not: {
      expression: QueryableNode
    }
    and: {
      expressions: QueryableNode[]
    }
    or: {
      expressions: QueryableNode[]
    }
    any2: {
      expressions: QueryableNode[]
    }
  }
  & {
    [Comp in Comparisons]: {
      left: Lang['measurement']
      right: Decimal
    }
  }

type BaseLang = NonQueryableBaseLang & QueryableBaseLang

export type Lang = {
  [Atom in keyof BaseLang]: {
    atom: Atom
  } & BaseLang[Atom]
}

export type AnyNode = Lang[keyof Lang]

export type QueryableNode = Lang[keyof QueryableBaseLang]

export type InsertableFindingBase = NonNullableProperty<Lang['finding'], 'root_snomed_concept' | 'specific_snomed_concept'> & {
  existence: Existence
}

export type InsertableFinding = InsertableFindingBase | Lang[Comparisons]

export type Investigation = NonNullableProperty<Lang['procedure'], 'root_snomed_concept' | 'specific_snomed_concept' | 'value'>

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

function isQualifier(node: AnyNode): node is Lang['qualifier'] {
  return node.atom === 'qualifier'
}

function isAttribute(node: AnyNode): node is Lang['attribute'] {
  return node.atom === 'attribute'
}

export const finding_base: z.ZodType<Lang['finding']> = z.lazy(() =>
  z.object({
    atom: z.literal('finding'),
    args: z.tuple([
      snomed_concept_or_attribute_or_qualifier.optional(),
      snomed_concept_or_attribute_or_qualifier.optional(),
      snomed_concept_or_attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
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

      const [qualifiers, attributes] = partition(nodes, isQualifier)

      return {
        atom,
        root_snomed_concept,
        specific_snomed_concept,
        value_snomed_concept,
        qualifiers,
        attributes,
        exact: false,
        history: false,
        existence: 'Yes' as const,
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
      snomed_concept_or_attribute_or_qualifier.optional(),
      snomed_concept_or_attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
      attribute_or_qualifier.optional(),
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

      const [qualifiers, attributes] = partition(nodes, isQualifier)

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
        exact: false,
        history: false,
        existence: 'Yes' as const,
      }
    },
  )
).describe('clinical_finding')

export const finding: z.ZodType<Lang['finding']> = z.lazy(() => finding_base.or(clinical_finding).or(allergy)).describe('finding')

export const insertable_finding_base: z.ZodType<InsertableFindingBase> = finding
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
    args: z.tuple([any_query]),
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
      }
    },
  )
).describe('evaluation')

const attribute_base: z.ZodType<Lang['attribute']> = z.lazy(() =>
  z.object({
    atom: z.literal('attribute'),
    args: z.tuple([snomed_concept, snomed_concept]),
  }).transform((
    { atom, args: [specific_snomed_concept, value] },
  ) => ({
    atom,
    specific_snomed_concept,
    value,
  }))
).describe('attribute_base')

const finding_site: z.ZodType<Lang['attribute']> = z.lazy(() =>
  z.object({
    atom: z.literal('finding_site'),
    args: z.tuple([snomed_concept]),
  }).transform((
    { args: [value] },
  ) => ({
    atom: 'attribute' as const,
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
    specific_snomed_concept,
    value: { atom: 'event' as const, datetime, location: null },
  }))
).describe('event')

export const attribute: z.ZodType<Lang['attribute']> = z.lazy(() => z.union([attribute_base, finding_site, event])).describe('attribute')

export const measurement: z.ZodType<Lang['measurement']> = z.lazy(() =>
  z.object({
    atom: z.literal('measurement'),
    args: z.tuple([snomed_concept, z.enum(UNITS_ARRAY)]),
  }).transform(({ atom, args: [snomed_concept, units] }) => ({
    atom,
    snomed_concept,
    units,
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
      qualifiers: [],
      attributes: snomed_concept
        ? [{
          atom: 'attribute' as const,
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
          }
        },
      ),
  }).transform(({ atom, args }) => ({
    atom,
    ...args,
  }))
).describe('procedure_base')

export const check_for: z.ZodType<Lang['procedure']> = z.lazy(
  () =>
    z.object({
      atom: z.literal('check_for'),
      args: insertable_finding_base.array(),
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
      value: measurement_nodes,
    })),
).describe('measure')

export const procedure: z.ZodType<Lang['procedure']> = z.lazy(() => procedure_base.or(check_for).or(measure)).describe('measure')

export const investigation: z.ZodType<Investigation> = procedure
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
  .describe('investigation')

export const comparator: z.ZodType<Lang[Comparisons]> = z.lazy(() =>
  z.object({
    atom: z.enum([
      '>',
      '<',
      '>=',
      '<=',
      '=',
    ]),
    args: z.tuple([measurement, validators.positive_decimal]),
  }).transform(({ atom, args: [left, right] }) => ({
    atom,
    left,
    right,
  }))
).describe('comparator')

export const history: z.ZodType<Lang['finding'] & { history: true }> = z.lazy(() =>
  z.object({
    atom: z.literal('history'),
    args: z.tuple([finding]),
  }).transform(({ args: [finding] }) => ({
    ...finding,
    history: true as const,
  }))
).describe('history')

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
      any_query,
      procedure,
    ]),
  }).transform(({ atom, args: [description, ages, due_to, procedure] }) => ({
    atom,
    description,
    ages,
    due_to,
    procedure,
  }))
).describe('task')

export const system_priority_evaluation: z.ZodType<Lang['system_priority_evaluation']> = z.lazy(() =>
  z.object({
    atom: z.literal('system_priority_evaluation'),
    args: z.tuple([
      ages,
      z.enum([
        'Emergency',
        'Very urgent',
        'Urgent',
      ]),
      any_query,
    ]),
  }).transform(({ atom, args: [ages, priority, due_to] }) => ({
    atom,
    ages,
    priority,
    due_to,
  }))
).describe('system_priority_evaluation')

export const insertable_finding: z.ZodType<InsertableFinding> = z.lazy(() => comparator.or(insertable_finding_base)).describe(
  'insertable_finding',
)

export const not: z.ZodType<Lang['not']> = z.lazy(() =>
  z.object({
    atom: z.literal('not'),
    args: z.tuple([any_query]),
  }).transform(({ atom, args: [expression] }) => ({
    atom,
    expression,
  }))
).describe('not')

export const or: z.ZodType<Lang['or']> = z.lazy(() =>
  z.object({
    atom: z.literal('or'),
    args: z.array(any_query),
  }).transform(({ atom, args }) => ({
    atom,
    expressions: args,
  }))
).describe('or')

export const and: z.ZodType<Lang['and']> = z.lazy(() =>
  z.object({
    atom: z.literal('and'),
    args: z.array(any_query),
  }).transform(({ atom, args }) => ({
    atom,
    expressions: args,
  }))
).describe('and')

export const any2: z.ZodType<Lang['any2']> = z.lazy(() =>
  z.object({
    atom: z.literal('any2'),
    args: z.array(any_query),
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
    args: z.tuple([diagnosis, ages, any_query]),
  }).transform(({ atom, args: [diagnosis, ages, due_to] }) => ({
    atom,
    diagnosis,
    ages,
    due_to,
  }))
).describe('system_diagnosis_rule')

export const any_query: z.ZodType<QueryableNode> = z.lazy(() =>
  z.union([
    event,
    finding,
    evaluation,
    procedure,
    measurement,
    active_condition,
    comparator,
    qualifier,
    exact,
    or,
    and,
    not,
    any2,
    diagnosis,
  ])
).describe('any_query')
