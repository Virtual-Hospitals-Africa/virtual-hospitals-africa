import { z } from 'zod'
import * as validators from '../util/validators.ts'
import compact from '../util/compact.ts'

type Node<Atom, Rest> = {
  atom: Atom
} & Rest

type RecordSchema = {
  snomed_concept_id: string | null
  value_snomed_concept_id: string | null
  qualifiers: Array<Lang['qualifier'] | Lang['not_qualifier']>
}


type Comparisons = '>' | '<' | '>=' | '<=' | '='

type BaseLang = {
  finding: RecordSchema & {
    finding_snomed_concept_id: string | null
  }
  procedure: RecordSchema
  evaluation: RecordSchema
  qualifier: RecordSchema
  not_qualifier: {
    snomed_concept_id: string
    value_snomed_concept_id: string | null
  }
  measurement: {
    snomed_concept_id: string
  }
  active_condition: {
    snomed_concept_id: string
  }
  units: {
    value: number
    units: string
  }
} & {
  [Comp in Comparisons]: {
  left: Lang['measurement']
  right: Lang['units']
}
}

type Lang = {
  [A in keyof BaseLang]: Node<A, BaseLang[A]>
} & {
  not: Node<'not', {
    expression: AnyNode
  }>
  and: Node<'and', {
    expressions: AnyNode[]
  }>
  or: Node<'or', {
    expressions: AnyNode[]
  }>
  task: Node<'task', {
    left: AnyNode
    right: Lang['procedure']
  }>
}

type AnyNode = Lang[keyof Lang]

const finding_snomed_concept_record_schema: z.ZodType<
  RecordSchema & { finding_snomed_concept_id: string | null }
> = z.lazy(() =>
  z.union(
    [
      z.tuple([
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
      ]).transform((
        rest,
      ) => ({
        snomed_concept_id: null,
        finding_snomed_concept_id: null,
        value_snomed_concept_id: null,
        qualifiers: compact(rest),
      })),
      z.tuple([
        validators.snomed_concept_id,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
      ]).transform((
        [snomed_concept_id, ...rest],
      ) => ({
        snomed_concept_id,
        finding_snomed_concept_id: null,
        value_snomed_concept_id: null,
        qualifiers: compact(rest),
      })),
      z.tuple([
        validators.snomed_concept_id,
        validators.snomed_concept_id,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
      ]).transform((
        [snomed_concept_id, finding_snomed_concept_id, ...rest],
      ) => ({
        snomed_concept_id,
        finding_snomed_concept_id,
        value_snomed_concept_id: null,
        qualifiers: compact(rest),
      })),
      z.tuple([
        validators.snomed_concept_id,
        validators.snomed_concept_id,
        validators.snomed_concept_id,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
      ])
        .transform((
          [
            snomed_concept_id,
            finding_snomed_concept_id,
            value_snomed_concept_id,
            ...rest
          ],
        ) => ({
          snomed_concept_id,
          finding_snomed_concept_id,
          value_snomed_concept_id,
          qualifiers: compact(rest),
        })),
    ],
  )
)

const required_snomed_concept_record_schema: z.ZodType<
  RecordSchema
> = z.lazy(() =>
  z.union(
    [
      z.tuple([
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
      ]).transform((
        rest,
      ) => ({
        snomed_concept_id: null,
        value_snomed_concept_id: null,
        qualifiers: compact(rest),
      })),
      z.tuple([
        validators.snomed_concept_id,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
      ]).transform((
        [snomed_concept_id, ...rest],
      ) => ({
        snomed_concept_id,
        value_snomed_concept_id: null,
        qualifiers: compact(rest),
      })),
      z.tuple([
        validators.snomed_concept_id,
        validators.snomed_concept_id,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
        optional_qualifier,
      ])
        .transform(([snomed_concept_id, value_snomed_concept_id, ...rest]) => ({
          snomed_concept_id,
          value_snomed_concept_id,
          qualifiers: compact(rest),
        })),
    ],
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

export const not_qualifier: z.ZodType<Lang['not_qualifier']> = z.lazy(() =>
  z.object({
    atom: z.literal('not_qualifier'),
    args: z.tuple([
      validators.snomed_concept_id,
      validators.snomed_concept_id.optional(),
    ]),
  }).transform((
    { atom, args: [snomed_concept_id, value_snomed_concept_id] },
  ) => ({
    atom,
    snomed_concept_id,
    value_snomed_concept_id: value_snomed_concept_id || null,
  }))
)

export const optional_qualifier = z.lazy(() =>
  z.union([
    qualifier,
    not_qualifier,
  ]).optional()
)

export const finding: z.ZodType<Lang['finding']> = z.lazy(() =>
  z.object({
    atom: z.literal('finding'),
    args: finding_snomed_concept_record_schema,
  }).transform(({ atom, args }) => ({
    atom,
    ...args,
  }))
)


export const evaluation: z.ZodType<Lang['evaluation']> = z.lazy(() =>
  z.object({
    atom: z.literal('evaluation'),
    args: required_snomed_concept_record_schema,
  }).transform(({ atom, args }) => ({
    atom,
    ...args,
  }))
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

export const active_condition: z.ZodType<Lang['active_condition']> = z.lazy(() =>
  z.object({
    atom: z.literal('active_condition'),
    args: z.tuple([validators.snomed_concept_id]),
  }).transform(({ atom, args: [snomed_concept_id] }) => ({
    atom,
    snomed_concept_id,
  }))
)

export const units: z.ZodType<Lang['units']> = z.lazy(() =>
  z.object({
    atom: z.literal('units'),
    args: z.tuple([validators.positive_number, z.string()]),
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
    not_qualifier,
    task,
    or,
    and,
    not,
  ])
)
