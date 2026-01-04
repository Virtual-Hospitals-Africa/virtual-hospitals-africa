import { z } from 'zod'
import { type Decimal } from '../util/decimal.ts'
import * as validators from '../util/validators.ts'
import compact from '../util/compact.ts'
import partition from '../util/partition.ts'
import { assertArrayEmpty } from '../util/arraySize.ts'
import { assert } from 'std/assert/assert.ts'
import { isAtom } from './s_expression.ts'
import { Coordinates, Maybe } from '../types.ts'
import { snomed_category } from '../util/validators.ts'
import { SnomedCategory } from '../db.d.ts'

type Node<Atom, Rest> = {
  atom: Atom
} & Rest

type Comparisons = '>' | '<' | '>=' | '<=' | '='

type SnomedConcept =
  | { type: 'id'; id: string }
  | { type: 'name_and_category'; name: string; category: SnomedCategory }

type BaseLang =
  & {
    snomed_concept: SnomedConcept
    event: {
      specific_snomed_concept: Lang['snomed_concept']
      value: {
        datetime: string
        location: null | Coordinates
      }
    }
    finding: {
      root_snomed_concept: Lang['snomed_concept'] | null
      specific_snomed_concept: Lang['snomed_concept'] | null
      value_snomed_concept: Lang['snomed_concept'] | null
      events: Lang['event'][]
      qualifiers: Lang['qualifier'][]
      attributes: Lang['attribute'][]
    }
    procedure: {
      root_snomed_concept: Lang['snomed_concept'] | null
      specific_snomed_concept: Lang['snomed_concept'] | null
      events: Lang['event'][]
      qualifiers: Lang['qualifier'][]
      attributes: Lang['attribute'][]
    }
    evaluation: {
      root_snomed_concept: Lang['snomed_concept'] | null
      specific_snomed_concept: Lang['snomed_concept'] | null
      value_snomed_concept: Lang['snomed_concept'] | null
      evaluates: null | Lang['evaluates']
      events: Lang['event'][]
      qualifiers: Lang['qualifier'][]
      attributes: Lang['attribute'][]
    }
    evaluates: {
      expression: AnyNode
    }
    attribute: {
      specific_snomed_concept: Lang['snomed_concept']
      // qualifiers: Lang['qualifier'][]
      value: Lang['snomed_concept'] | null
    }
    qualifier: {
      specific_snomed_concept: Lang['snomed_concept']
      qualifiers: Lang['qualifier'][]
    }
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

const attribute_or_event_or_qualifier: z.ZodType<
  Lang['attribute'] | Lang['event'] | Lang['qualifier']
> = z.lazy(() =>
  z.union([
    attribute,
    event,
    qualifier,
  ])
).describe('attribute | qualifier')

const snomed_concept_or_attribute_or_event_or_qualifier: z.ZodType<
  | Lang['snomed_concept']
  | Lang['attribute']
  | Lang['event']
  | Lang['qualifier']
> = z.lazy(() =>
  z.union([
    snomed_concept,
    attribute_or_event_or_qualifier,
  ])
).describe('snomed_concept_id | qualifier')

function isQualifier(node: AnyNode): node is Lang['qualifier'] {
  return node.atom === 'qualifier'
}

function isAttribute(node: AnyNode): node is Lang['attribute'] {
  return node.atom === 'attribute'
}

function isEvent(node: AnyNode): node is Lang['event'] {
  return node.atom === 'event'
}

export const finding: z.ZodType<Lang['finding']> = z.lazy(() =>
  z.object({
    atom: z.literal('finding'),
    args: z.tuple([
      snomed_concept_or_attribute_or_event_or_qualifier.optional(),
      snomed_concept_or_attribute_or_event_or_qualifier.optional(),
      snomed_concept_or_attribute_or_event_or_qualifier.optional(),
      attribute_or_event_or_qualifier.optional(),
      attribute_or_event_or_qualifier.optional(),
      attribute_or_event_or_qualifier.optional(),
      attribute_or_event_or_qualifier.optional(),
      attribute_or_event_or_qualifier.optional(),
      attribute_or_event_or_qualifier.optional(),
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

      const [qualifiers, others] = partition(nodes, isQualifier)
      const [attributes, events] = partition(others, isAttribute)

      return {
        atom,
        root_snomed_concept,
        specific_snomed_concept,
        value_snomed_concept,
        qualifiers,
        attributes,
        events,
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

const attribute_or_event_or_qualifier_or_evaluates: z.ZodType<
  Lang['attribute'] | Lang['event'] | Lang['qualifier'] | Lang['evaluates']
> = z.lazy(() =>
  z.union([
    attribute_or_event_or_qualifier,
    evaluates,
  ])
).describe('attribute | event | qualifier | evaluates')

const snomed_concept_or_attribute_or_event_or_qualifier_or_evaluates: z.ZodType<
  | Lang['snomed_concept']
  | Lang['attribute']
  | Lang['event']
  | Lang['qualifier']
  | Lang['evaluates']
> = z.lazy(() =>
  z.union([
    snomed_concept,
    attribute_or_event_or_qualifier_or_evaluates,
  ])
).describe('snomed_concept | attribute | event | qualifier | evaluates')

export const evaluation: z.ZodType<Lang['evaluation']> = z.lazy(() =>
  z.object({
    atom: z.literal('evaluation'),
    args: z.tuple([
      snomed_concept_or_attribute_or_event_or_qualifier_or_evaluates.optional(),
      snomed_concept_or_attribute_or_event_or_qualifier_or_evaluates.optional(),
      snomed_concept_or_attribute_or_event_or_qualifier_or_evaluates.optional(),
      attribute_or_event_or_qualifier_or_evaluates.optional(),
      attribute_or_event_or_qualifier_or_evaluates.optional(),
      attribute_or_event_or_qualifier_or_evaluates.optional(),
      attribute_or_event_or_qualifier_or_evaluates.optional(),
      attribute_or_event_or_qualifier_or_evaluates.optional(),
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
      const [events, [evaluates = null, ...more_evaluates]] = partition(
        others2,
        isEvent,
      )

      assertArrayEmpty(more_evaluates)

      return {
        atom,
        root_snomed_concept,
        specific_snomed_concept,
        value_snomed_concept,
        qualifiers,
        evaluates,
        attributes,
        events,
      }
    },
  )
).describe('evaluation')

export const event: z.ZodType<Lang['event']> = z.lazy(() =>
  z.object({
    atom: z.literal('event'),
    args: z.tuple([snomed_concept, z.string()]),
  }).transform(({ atom, args: [specific_snomed_concept, datetime] }) => ({
    atom,
    specific_snomed_concept,
    value: { datetime, location: null },
  }))
).describe('event')

export const attribute: z.ZodType<Lang['attribute']> = z.lazy(() =>
  z.object({
    atom: z.literal('attribute'),
    args: z.tuple([snomed_concept, snomed_concept.optional()]),
  }).transform((
    { atom, args: [specific_snomed_concept, value = null] },
  ) => ({
    atom,
    specific_snomed_concept,
    value,
  }))
).describe('attribute')

export const procedure: z.ZodType<Lang['procedure']> = z.lazy(() =>
  z.object({
    atom: z.literal('procedure'),
    args: z.tuple([
      snomed_concept_or_attribute_or_event_or_qualifier.optional(),
      snomed_concept_or_attribute_or_event_or_qualifier.optional(),
      attribute_or_event_or_qualifier.optional(),
      attribute_or_event_or_qualifier.optional(),
      attribute_or_event_or_qualifier.optional(),
      attribute_or_event_or_qualifier.optional(),
      attribute_or_event_or_qualifier.optional(),
      attribute_or_event_or_qualifier.optional(),
    ])
      .transform(
        (
          [
            root_snomed_concept = null,
            specific_snomed_concept = null,
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

          const [qualifiers, others] = partition(nodes, isQualifier)
          const [attributes, events] = partition(others, isAttribute)

          return {
            root_snomed_concept,
            specific_snomed_concept,
            qualifiers,
            attributes,
            events,
          }
        },
      ),
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
    event,
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
