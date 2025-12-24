import z from 'zod'
import * as validators from '../util/validators.ts'

type Qualifier = RecordSchema & { 
  atom: 'qualifier'
}

type RecordSchema = {
  snomed_concept_id: string | null
  value_snomed_concept_id: string | null
  qualifiers: Array<Qualifier>
}

const record_schema: z.ZodType<RecordSchema> = z.lazy(() => {
  return z.xor(
    [
      z.tuple([validators.snomed_concept_id]).transform((
        [snomed_concept_id],
      ) => ({
        snomed_concept_id,
      })),
      z.tuple([validators.snomed_concept_id, validators.snomed_concept_id])
        .transform(([snomed_concept_id, value_snomed_concept_id]) => ({
          snomed_concept_id,
          value_snomed_concept_id,
        })),
      z.tuple([qualifiers])
        .transform(([qualifiers]) => ({
          qualifiers,
        })),
      z.tuple([validators.snomed_concept_id, qualifiers])
        .transform(([snomed_concept_id, qualifiers]) => ({
          snomed_concept_id,
          qualifiers,
        })),
      z.tuple([validators.snomed_concept_id, validators.snomed_concept_id, qualifiers])
        .transform(([snomed_concept_id, value_snomed_concept_id, qualifiers]) => ({
          snomed_concept_id,
          value_snomed_concept_id,
          qualifiers,
        })),
    ],
  )
  .transform(args => ({
    snomed_concept_id: null,
    value_snomed_concept_id: null,
    qualifiers: [],
    ...args
  }))
})

export const qualifiers = z.lazy(() => z.object({
  atom: z.literal('qualifiers'),
  args: z.array(z.xor([qualifier, not])),
}).transform(({ args }) => args))

export const qualifier = z.lazy(() => 
    z.object({
    atom: z.literal('qualifier'),
    args: record_schema,
  }).transform(({ atom, args }) => ({
    atom,
    ...args,
  })))

export const finding = z.lazy(() => 
    z.object({
    atom: z.literal('finding'),
    args: record_schema,
  }).transform(({ atom, args }) => ({
    atom,
    ...args,
  })))

export const evaluation = z.lazy(() => 
    z.object({
    atom: z.literal('evaluation'),
    args: record_schema,
  }).transform(({ atom, args }) => ({
    atom,
    ...args,
  })))

export const procedure = z.lazy(() => 
    z.object({
    atom: z.literal('procedure'),
    args: record_schema,
  }).transform(({ atom, args }) => ({
    atom,
    ...args,
  })))


export const measurement = z.lazy(() => 
  z.object({
    atom: z.literal('measurement'),
    args: z.tuple([validators.snomed_concept_id]),
  }).transform(({ atom, args: [snomed_concept_id] }) => ({
    atom,
    snomed_concept_id,
  })))

export const active_condition = z.lazy(() => 
  z.object({
    atom: z.literal('active_condition'),
    args: z.tuple([validators.snomed_concept_id]),
  }).transform(({ atom, args: [snomed_concept_id] }) => ({
    atom,
    snomed_concept_id,
  })))

export const units = z.lazy(() => 
  z.object({
    atom: z.literal('units'),
    args: z.tuple([validators.positive_number, z.string()]),
  }).transform(({ atom, args: [value, units] }) => ({
    atom,
    value,
    units
  })))

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
    atom: 'comparator',
    comparison: atom,
    left,
    right
  })))

export const any_top_level_expression = z.lazy(() => 
  z.xor([
    finding,
    evaluation,
    procedure,
    measurement,
    active_condition,
    comparator,
  ])
)
export const not = z.lazy(() => 
  z.object({
    atom: z.literal('not'),
    args: z.tuple([any_top_level_expression]),
  }).transform(({ atom, args: [expression] }) => ({
    atom,
    expression
  })))

export const any_expression_plus_not = z.lazy(() => 
  z.xor([
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
    expressions: args
  })))

export const and = z.lazy(() => 
  z.object({
    atom: z.literal('and'),
    args: z.array(any_expression_plus_not),
  }).transform(({ atom, args }) => ({
    atom,
    expressions: args
  })))


export const any_expression = z.lazy(() => 
  z.xor([
    any_top_level_expression,
    or,
    and,
    not,
  ])
)