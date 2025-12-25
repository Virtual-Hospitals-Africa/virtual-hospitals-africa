import { z } from 'zod'
import * as validators from '../util/validators.ts'
import compact from '../util/compact.ts'

type Qualifier = RecordSchema & {
  atom: 'qualifier'
}

type NotQualifier = {
  atom: 'not_qualifier'
  snomed_concept_id: string
  value_snomed_concept_id: string | null
}

type RecordSchema = {
  snomed_concept_id: string
  value_snomed_concept_id: string | null
  qualifiers: Array<Qualifier | NotQualifier>
}

const required_snomed_concept_record_schema: z.ZodType<
  RecordSchema & { snomed_concept_id: string }
> = z.lazy(() =>
  z.union(
    [
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

export const qualifier = z.lazy((): z.ZodType<Qualifier> =>
  z.object({
    atom: z.literal('qualifier'),
    args: required_snomed_concept_record_schema,
  }).transform(({ atom, args }) => ({
    atom,
    ...args,
  }))
)

export const not_qualifier = z.lazy((): z.ZodType<NotQualifier> =>
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

export const finding = z.lazy(() =>
  z.object({
    atom: z.literal('finding'),
    args: required_snomed_concept_record_schema,
  }).transform(({ atom, args }) => ({
    atom,
    ...args,
  }))
)

export const evaluation = z.lazy(() =>
  z.object({
    atom: z.literal('evaluation'),
    args: required_snomed_concept_record_schema,
  }).transform(({ atom, args }) => ({
    atom,
    ...args,
  }))
)

export const procedure = z.lazy(() =>
  z.object({
    atom: z.literal('procedure'),
    args: required_snomed_concept_record_schema,
  }).transform(({ atom, args }) => ({
    atom,
    ...args,
  }))
)

export const measurement = z.lazy(() =>
  z.object({
    atom: z.literal('measurement'),
    args: z.tuple([validators.snomed_concept_id]),
  }).transform(({ atom, args: [snomed_concept_id] }) => ({
    atom,
    snomed_concept_id,
  }))
)

export const active_condition = z.lazy(() =>
  z.object({
    atom: z.literal('active_condition'),
    args: z.tuple([validators.snomed_concept_id]),
  }).transform(({ atom, args: [snomed_concept_id] }) => ({
    atom,
    snomed_concept_id,
  }))
)

export const units = z.lazy(() =>
  z.object({
    atom: z.literal('units'),
    args: z.tuple([validators.positive_number, z.string()]),
  }).transform(({ atom, args: [value, units] }) => ({
    atom,
    value,
    units,
  }))
)

export const comparator = z.lazy(() =>
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

export const task = z.lazy(() =>
  z.object({
    atom: z.literal('task'),
    args: z.tuple([
      any_top_level_expression,
      procedure,
    ]),
  }).transform(({ atom, args: [left, right] }) => ({
    atom,
    left,
    right,
  }))
)

export const any_top_level_expression = z.lazy(() =>
  z.union([
    finding,
    evaluation,
    procedure,
    measurement,
    active_condition,
    comparator,
    qualifier,
    not_qualifier,
  ])
)

export const not = z.lazy(() =>
  z.object({
    atom: z.literal('not'),
    args: z.tuple([any_top_level_expression]),
  }).transform(({ atom, args: [expression] }) => ({
    atom,
    expression,
  }))
)

export const any_expression_plus_not = z.lazy(() =>
  z.union([
    any_top_level_expression,
    not,
  ])
)

export const or = z.lazy(() =>
  z.object({
    atom: z.literal('or'),
    args: z.array(any_expression_plus_not),
  }).transform(({ atom, args }) => ({
    atom,
    expressions: args,
  }))
)

export const and = z.lazy(() =>
  z.object({
    atom: z.literal('and'),
    args: z.array(any_expression_plus_not),
  }).transform(({ atom, args }) => ({
    atom,
    expressions: args,
  }))
)

export const any_expression = z.lazy(() =>
  z.union([
    any_top_level_expression,
    task,
    or,
    and,
    not,
  ])
)
