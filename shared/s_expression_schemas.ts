import { z } from 'zod'
import { type Decimal } from 'decimal'
import * as validators from '../util/validators.ts'
import compact from '../util/compact.ts'
import partition from '../util/partition.ts'
import isString from '../util/isString.ts'
import { assertArrayEmpty } from '../util/arraySize.ts'
import { assert } from 'std/assert/assert.ts'

type Node<Atom, Rest> = {
  atom: Atom
} & Rest

type RecordSchema = {
  snomed_concept_id: string | null
  value_snomed_concept_id: string | null
  qualifiers: Lang['qualifier'][]
}

type Comparisons = '>' | '<' | '>=' | '<=' | '='

type BaseLang =
  & {
    finding: RecordSchema & {
      finding_snomed_concept_id: string | null
      not_findings: Lang['not_finding'][]
    }
    procedure: RecordSchema
    evaluation: RecordSchema & {
      evaluates: null | Lang['evaluates']
    }
    evaluates: {
      expression: AnyNode
    }
    qualifier: RecordSchema
    not_finding: {
      finding_snomed_concept_id: string
      value_snomed_concept_id: string | null
      qualifiers: Lang['qualifier'][]
    }
    measurement: {
      snomed_concept_id: string
    }
    active_condition: {
      snomed_concept_id: string
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

const snomed_concept_id_or_qualifier: z.ZodType<string | Lang['qualifier']> = z
  .lazy(() =>
    z.union([
      validators.snomed_concept_id,
      qualifier,
    ])
  )

const required_snomed_concept_record_schema: z.ZodType<
  RecordSchema
> = z.lazy(() =>
  z.tuple([
    snomed_concept_id_or_qualifier.optional(),
    snomed_concept_id_or_qualifier.optional(),
    qualifier.optional(),
    qualifier.optional(),
    qualifier.optional(),
    qualifier.optional(),
    qualifier.optional(),
  ])
    .transform(
      ([snomed_concept_id = null, value_snomed_concept_id = null, ...rest]) => {
        const nodes = compact(rest)

        if (value_snomed_concept_id && !isString(value_snomed_concept_id)) {
          assert(!isString(snomed_concept_id))
          nodes.unshift(value_snomed_concept_id)
          value_snomed_concept_id = null
        }

        if (snomed_concept_id && !isString(snomed_concept_id)) {
          nodes.unshift(snomed_concept_id)
          snomed_concept_id = null
        }

        return {
          snomed_concept_id,
          value_snomed_concept_id,
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
)

export const not_finding: z.ZodType<Lang['not_finding']> = z.lazy(() =>
  z.object({
    atom: z.literal('not_finding'),
    args: z.tuple([
      validators.snomed_concept_id,
      snomed_concept_id_or_qualifier.optional(),
      qualifier.optional(),
      qualifier.optional(),
      qualifier.optional(),
      qualifier.optional(),
      qualifier.optional(),
    ]),
  }).transform((
    {
      atom,
      args: [
        finding_snomed_concept_id,
        value_snomed_concept_id = null,
        ...rest
      ],
    },
  ) => {
    const qualifiers = compact(rest)

    if (value_snomed_concept_id && !isString(value_snomed_concept_id)) {
      qualifiers.unshift(value_snomed_concept_id)
      value_snomed_concept_id = null
    }

    return {
      atom,
      finding_snomed_concept_id,
      value_snomed_concept_id,
      qualifiers,
    }
  })
)

const qualifier_or_not_finding: z.ZodType<
  Lang['qualifier'] | Lang['not_finding']
> = z.lazy(() =>
  z.union([
    qualifier,
    not_finding,
  ])
)

const snomed_concept_id_or_qualifier_or_not_finding: z.ZodType<
  string | Lang['qualifier'] | Lang['not_finding']
> = z.lazy(() =>
  z.union([
    validators.snomed_concept_id,
    qualifier,
    not_finding,
  ])
)

function isQualifier(node: AnyNode): node is Lang['qualifier'] {
  return node.atom === 'qualifier'
}

export const finding: z.ZodType<Lang['finding']> = z.lazy(() =>
  z.object({
    atom: z.literal('finding'),
    args: z.tuple([
      snomed_concept_id_or_qualifier_or_not_finding.optional(),
      snomed_concept_id_or_qualifier_or_not_finding.optional(),
      snomed_concept_id_or_qualifier_or_not_finding.optional(),
      qualifier_or_not_finding.optional(),
      qualifier_or_not_finding.optional(),
      qualifier_or_not_finding.optional(),
      qualifier_or_not_finding.optional(),
      qualifier_or_not_finding.optional(),
      qualifier_or_not_finding.optional(),
    ]),
  }).transform(
    (
      {
        atom,
        args: [
          snomed_concept_id = null,
          finding_snomed_concept_id = null,
          value_snomed_concept_id = null,
          ...rest
        ],
      },
    ) => {
      const nodes = compact(rest)

      if (value_snomed_concept_id && !isString(value_snomed_concept_id)) {
        assert(!isString(finding_snomed_concept_id))
        assert(!isString(snomed_concept_id))
        nodes.unshift(value_snomed_concept_id)
        value_snomed_concept_id = null
      }

      if (finding_snomed_concept_id && !isString(finding_snomed_concept_id)) {
        assert(!isString(snomed_concept_id))
        nodes.unshift(finding_snomed_concept_id)
        finding_snomed_concept_id = null
      }

      if (snomed_concept_id && !isString(snomed_concept_id)) {
        nodes.unshift(snomed_concept_id)
        snomed_concept_id = null
      }

      const [qualifiers, not_findings] = partition(nodes, isQualifier)

      return {
        atom,
        snomed_concept_id,
        finding_snomed_concept_id,
        value_snomed_concept_id,
        qualifiers,
        not_findings,
      }
    },
  )
)

export const evaluates: z.ZodType<Lang['evaluates']> = z.lazy(() =>
  z.object({
    atom: z.literal('evaluates'),
    args: z.tuple([any_expression]),
  }).transform(({ atom, args: [expression] }) => ({
    atom,
    expression,
  }))
)

const snomed_concept_id_or_qualifier_or_evaluates: z.ZodType<
  string | Lang['qualifier'] | Lang['evaluates']
> = z.lazy(() =>
  z.union([
    validators.snomed_concept_id,
    qualifier,
    evaluates,
  ])
)

const qualifier_or_evaluates: z.ZodType<Lang['qualifier'] | Lang['evaluates']> =
  z.lazy(() =>
    z.union([
      qualifier,
      evaluates,
    ])
  )

export const evaluation: z.ZodType<Lang['evaluation']> = z.lazy(() =>
  z.object({
    atom: z.literal('evaluation'),
    args: z.tuple([
      snomed_concept_id_or_qualifier_or_evaluates.optional(),
      snomed_concept_id_or_qualifier_or_evaluates.optional(),
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
          snomed_concept_id = null,
          value_snomed_concept_id = null,
          ...rest
        ],
      },
    ) => {
      const nodes = compact(rest)

      if (value_snomed_concept_id && !isString(value_snomed_concept_id)) {
        assert(!isString(snomed_concept_id))
        nodes.unshift(value_snomed_concept_id)
        value_snomed_concept_id = null
      }

      if (snomed_concept_id && !isString(snomed_concept_id)) {
        nodes.unshift(snomed_concept_id)
        snomed_concept_id = null
      }

      const [qualifiers, [evaluates = null, ...more_evaluates]] = partition(
        nodes,
        isQualifier,
      )
      assertArrayEmpty(more_evaluates)

      return {
        atom,
        snomed_concept_id,
        value_snomed_concept_id,
        qualifiers,
        evaluates,
      }
    },
  )
)

export const procedure: z.ZodType<Lang['procedure']> = z.lazy(() =>
  z.object({
    atom: z.literal('procedure'),
    args: required_snomed_concept_record_schema,
  }).transform(({ atom, args }) => ({
    atom,
    ...args,
  }))
)

export const measurement: z.ZodType<Lang['measurement']> = z.lazy(() =>
  z.object({
    atom: z.literal('measurement'),
    args: z.tuple([validators.snomed_concept_id]),
  }).transform(({ atom, args: [snomed_concept_id] }) => ({
    atom,
    snomed_concept_id,
  }))
)

export const active_condition: z.ZodType<Lang['active_condition']> = z.lazy(
  () =>
    z.object({
      atom: z.literal('active_condition'),
      args: z.tuple([validators.snomed_concept_id]),
    }).transform(({ atom, args: [snomed_concept_id] }) => ({
      atom,
      snomed_concept_id,
    })),
)

export const units: z.ZodType<Lang['units']> = z.lazy(() =>
  z.object({
    atom: z.literal('units'),
    args: z.tuple([validators.positive_decimal, z.string()]),
  }).transform(({ atom, args: [value, units] }) => ({
    atom,
    value,
    units,
  }))
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
)

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
)

export const not: z.ZodType<Lang['not']> = z.lazy(() =>
  z.object({
    atom: z.literal('not'),
    args: z.tuple([any_expression]),
  }).transform(({ atom, args: [expression] }) => ({
    atom,
    expression,
  }))
)

export const or: z.ZodType<Lang['or']> = z.lazy(() =>
  z.object({
    atom: z.literal('or'),
    args: z.array(any_expression),
  }).transform(({ atom, args }) => ({
    atom,
    expressions: args,
  }))
)

export const and: z.ZodType<Lang['and']> = z.lazy(() =>
  z.object({
    atom: z.literal('and'),
    args: z.array(any_expression),
  }).transform(({ atom, args }) => ({
    atom,
    expressions: args,
  }))
)

export const any_expression: z.ZodType<AnyNode> = z.lazy(() =>
  z.union([
    finding,
    evaluation,
    procedure,
    measurement,
    active_condition,
    comparator,
    qualifier,
    not_finding,
    task,
    or,
    and,
    not,
  ])
)
