import { z } from 'zod'
import { type Decimal } from '../util/decimal.ts'
import * as validators from '../util/validators.ts'
import compact from '../util/compact.ts'
import partition from '../util/partition.ts'
import { assertArrayEmpty } from '../util/arraySize.ts'
import { assert } from 'std/assert/assert.ts'
import { isAtom } from './s_expression.ts'
import { Maybe } from '../types.ts'
import { snomed_category } from '../util/validators.ts'
import { SnomedCategory } from '../db.d.ts'

type Node<Atom, Rest> = {
  atom: Atom
} & Rest

type RecordSchema = {
  snomed_concept: Lang['snomed_concept'] | null
  value_snomed_concept: Lang['snomed_concept'] | null
  qualifiers: Lang['qualifier'][]
}

type Comparisons = '>' | '<' | '>=' | '<=' | '='

type SnomedConcept =
  | { type: 'id'; id: string }
  | { type: 'name_and_category'; name: string; category: SnomedCategory }
// | { type: 'name', name: string }

type BaseLang =
  & {
    snomed_concept: SnomedConcept
    finding: RecordSchema & {
      finding_snomed_concept: Lang['snomed_concept'] | null
      attributes: Lang['attribute'][]
    }
    procedure: RecordSchema
    evaluation: RecordSchema & {
      evaluates: null | Lang['evaluates']
    }
    evaluates: {
      expression: AnyNode
    }
    attribute: {
      finding_snomed_concept: Lang['snomed_concept']
      value_snomed_concept: Lang['snomed_concept']
    }
    qualifier: RecordSchema
    measurement: {
      snomed_concept: Lang['snomed_concept']
    }
    active_condition: {
      snomed_concept: Lang['snomed_concept']
    }
    units: {
      value: Decimal
      units: string
    }
    not: {
      expression: AnyNode
    }
    and: {
      expressions: AnyNode[]
    }
    or: {
      expressions: AnyNode[]
    }
    task: {
      left: AnyNode
      right: Lang['procedure']
    }
  }
  & {
    [Comp in Comparisons]: {
      left: Lang['measurement']
      right: Lang['units']
    }
  }

export type Lang = {
  [A in keyof BaseLang]: Node<A, BaseLang[A]>
}

export type AnyNode = Lang[keyof Lang]

const snomed_concept_id: z.ZodType<Lang['snomed_concept']> = validators
  .snomed_concept_id.transform((id) => ({
    atom: 'snomed_concept',
    type: 'id',
    id,
  }))

const snomed_concept_name_and_category: z.ZodType<Lang['snomed_concept']> = z
  .object({
    atom: z.literal('snomed_concept'),
    args: z.tuple([z.string(), snomed_category]),
  }).transform(({ atom, args: [name, category] }) => ({
    atom,
    name,
    category,
    type: 'name_and_category',
  }))

export const snomed_concept: z.ZodType<Lang['snomed_concept']> = z.union([
  snomed_concept_id,
  snomed_concept_name_and_category,
]).describe('snomed_concept_id | qualifier')

const snomed_concept_or_qualifier: z.ZodType<
  Lang['snomed_concept'] | Lang['qualifier']
> = z
  .lazy(() =>
    z.union([
      snomed_concept,
      qualifier,
    ])
  )
  .describe('snomed_concept_id | qualifier')

function isSnomedConcept(node: Maybe<AnyNode>): node is Lang['snomed_concept'] {
  return !!node && isAtom(node, 'snomed_concept')
}

const required_snomed_concept_record_schema: z.ZodType<
  RecordSchema
> = z.lazy(() =>
  z.tuple([
    snomed_concept_or_qualifier.optional(),
    snomed_concept_or_qualifier.optional(),
    qualifier.optional(),
    qualifier.optional(),
    qualifier.optional(),
    qualifier.optional(),
    qualifier.optional(),
  ])
    .transform(
      ([snomed_concept = null, value_snomed_concept = null, ...rest]) => {
        const nodes = compact(rest)

        if (value_snomed_concept && !isSnomedConcept(value_snomed_concept)) {
          nodes.unshift(value_snomed_concept)
          value_snomed_concept = null
        }

        if (snomed_concept && !isSnomedConcept(snomed_concept)) {
          assert(!isSnomedConcept(value_snomed_concept))
          nodes.unshift(snomed_concept)
          snomed_concept = null
        }

        return {
          snomed_concept,
          value_snomed_concept,
          qualifiers: compact(rest),
        }
      },
    )
)

export const qualifier: z.ZodType<Lang['qualifier']> = z.lazy(() =>
  z.object({
    atom: z.literal('qualifier'),
    args: required_snomed_concept_record_schema,
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
    attribute,
    qualifier,
  ])
).describe('snomed_concept_id | qualifier')

function isQualifier(node: AnyNode): node is Lang['qualifier'] {
  return node.atom === 'qualifier'
}

export const finding: z.ZodType<Lang['finding']> = z.lazy(() =>
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
          snomed_concept = null,
          finding_snomed_concept = null,
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

      if (finding_snomed_concept && !isSnomedConcept(finding_snomed_concept)) {
        assert(!isSnomedConcept(value_snomed_concept))
        nodes.unshift(finding_snomed_concept)
        finding_snomed_concept = null
      }

      if (snomed_concept && !isSnomedConcept(snomed_concept)) {
        assert(!isSnomedConcept(value_snomed_concept))
        assert(!isSnomedConcept(finding_snomed_concept))
        nodes.unshift(snomed_concept)
        snomed_concept = null
      }

      const [qualifiers, attributes] = partition(nodes, isQualifier)

      return {
        atom,
        snomed_concept,
        finding_snomed_concept,
        value_snomed_concept,
        qualifiers,
        attributes,
      }
    },
  )
).describe('finding')

export const evaluates: z.ZodType<Lang['evaluates']> = z.lazy(() =>
  z.object({
    atom: z.literal('evaluates'),
    args: z.tuple([any_expression]),
  }).transform(({ atom, args: [expression] }) => ({
    atom,
    expression,
  }))
).describe('evaluates')

const snomed_concept_or_qualifier_or_evaluates: z.ZodType<
  Lang['snomed_concept'] | Lang['qualifier'] | Lang['evaluates']
> = z.lazy(() =>
  z.union([
    snomed_concept,
    qualifier,
    evaluates,
  ])
).describe('snomed_concept | qualifier | evaluates')

const qualifier_or_evaluates: z.ZodType<Lang['qualifier'] | Lang['evaluates']> =
  z.lazy(() =>
    z.union([
      qualifier,
      evaluates,
    ])
  ).describe('qualifier | evaluates')

export const evaluation: z.ZodType<Lang['evaluation']> = z.lazy(() =>
  z.object({
    atom: z.literal('evaluation'),
    args: z.tuple([
      snomed_concept_or_qualifier_or_evaluates.optional(),
      snomed_concept_or_qualifier_or_evaluates.optional(),
      qualifier_or_evaluates.optional(),
      qualifier_or_evaluates.optional(),
      qualifier_or_evaluates.optional(),
      qualifier_or_evaluates.optional(),
      qualifier_or_evaluates.optional(),
    ]),
  }).transform(
    (
      {
        atom,
        args: [
          snomed_concept = null,
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

      if (snomed_concept && !isSnomedConcept(snomed_concept)) {
        assert(!isSnomedConcept(value_snomed_concept))
        nodes.unshift(snomed_concept)
        snomed_concept = null
      }

      const [qualifiers, [evaluates = null, ...more_evaluates]] = partition(
        nodes,
        isQualifier,
      )
      assertArrayEmpty(more_evaluates)

      return {
        atom,
        snomed_concept,
        value_snomed_concept,
        qualifiers,
        evaluates,
      }
    },
  )
).describe('evaluation')

export const attribute: z.ZodType<Lang['attribute']> = z.lazy(() =>
  z.object({
    atom: z.literal('attribute'),
    args: z.tuple([snomed_concept, snomed_concept]),
  }).transform((
    { atom, args: [finding_snomed_concept, value_snomed_concept] },
  ) => ({
    atom,
    finding_snomed_concept,
    value_snomed_concept,
  }))
).describe('attribute')

export const procedure: z.ZodType<Lang['procedure']> = z.lazy(() =>
  z.object({
    atom: z.literal('procedure'),
    args: required_snomed_concept_record_schema,
  }).transform(({ atom, args }) => ({
    atom,
    ...args,
  }))
).describe('procedure')

export const measurement: z.ZodType<Lang['measurement']> = z.lazy(() =>
  z.object({
    atom: z.literal('measurement'),
    args: z.tuple([snomed_concept]),
  }).transform(({ atom, args: [snomed_concept] }) => ({
    atom,
    snomed_concept,
  }))
).describe('measurement')

export const active_condition: z.ZodType<Lang['active_condition']> = z.lazy(
  () =>
    z.object({
      atom: z.literal('active_condition'),
      args: z.tuple([snomed_concept]),
    }).transform(({ atom, args: [snomed_concept] }) => ({
      atom,
      snomed_concept,
    })),
).describe('active_condition')

export const units: z.ZodType<Lang['units']> = z.lazy(() =>
  z.object({
    atom: z.literal('units'),
    args: z.tuple([validators.positive_decimal, z.string()]),
  }).transform(({ atom, args: [value, units] }) => ({
    atom,
    value,
    units,
  })).describe('units')
)

export const comparator: z.ZodType<Lang[Comparisons]> = z.lazy(() =>
  z.object({
    atom: z.enum([
      '>',
      '<',
      '>=',
      '<=',
      '=',
    ]),
    args: z.tuple([measurement, units]),
  }).transform(({ atom, args: [left, right] }) => ({
    atom,
    left,
    right,
  }))
).describe('comparator')

export const task: z.ZodType<Lang['task']> = z.lazy(() =>
  z.object({
    atom: z.literal('task'),
    args: z.tuple([
      any_expression,
      procedure,
    ]),
  }).transform(({ atom, args: [left, right] }) => ({
    atom,
    left,
    right,
  }))
).describe('task')

export const not: z.ZodType<Lang['not']> = z.lazy(() =>
  z.object({
    atom: z.literal('not'),
    args: z.tuple([any_expression]),
  }).transform(({ atom, args: [expression] }) => ({
    atom,
    expression,
  }))
).describe('not')

export const or: z.ZodType<Lang['or']> = z.lazy(() =>
  z.object({
    atom: z.literal('or'),
    args: z.array(any_expression),
  }).transform(({ atom, args }) => ({
    atom,
    expressions: args,
  }))
).describe('or')

export const and: z.ZodType<Lang['and']> = z.lazy(() =>
  z.object({
    atom: z.literal('and'),
    args: z.array(any_expression),
  }).transform(({ atom, args }) => ({
    atom,
    expressions: args,
  }))
).describe('and')

export const any_expression: z.ZodType<AnyNode> = z.lazy(() =>
  z.union([
    snomed_concept,
    finding,
    evaluation,
    procedure,
    attribute,
    measurement,
    active_condition,
    comparator,
    qualifier,
    task,
    or,
    and,
    not,
  ])
)
