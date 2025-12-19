import { sql } from 'kysely'
import { MostRecentVitalMeasurement, Priority, TrxOrDb } from '../../types.ts'
import {
  jsonArrayFrom,
  jsonObjectFrom,
  literalString,
  success_true,
} from '../helpers.ts'
import { VITALS_SNOMED_CODE } from '../../shared/vitals.ts'
import generateUUID from '../../util/uuid.ts'
import z from 'zod'
import flatten from '../../util/flatten.ts'
import { decimal } from '../../util/validators.ts'
import * as patient_encounter_employees from './patient_encounter_employees.ts'
import {
  ParsedEvaluationExpression,
  ParsedExpression,
} from '../../shared/s_expression.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { PRIORITY_SNOMED_CODES } from '../../shared/priorities.ts'
import entries from '../../util/entries.ts'

export interface VitalsEvaluation {
  finding_id: string
  snomed_concept_id: string
  priority?: Priority
  note?: string
}

export function mapPriorityFromSnomedCode(
  snomed_code: string,
): Priority | undefined {
  return entries(PRIORITY_SNOMED_CODES).find(([_, code]) =>
    code === snomed_code
  )?.[0]
}

type PatientEvaluationInsert =
  & {
    patient_id: string
    patient_encounter_id: string
    evaluation: ParsedEvaluationExpression
    evaluates_record_id: string
  }
  & (
    {
      employment_id: string
      by_system?: never
    } | {
      employment_id?: never
      by_system: true
    }
  )

export function insertOne(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    evaluates_record_id,
    evaluation,
    employment_id,
    by_system,
  }: PatientEvaluationInsert,
) {
  const evaluation_id = generateUUID()

  let query = trx.with(
    'inserting_evaluation_record',
    (qb) =>
      qb.insertInto('patient_records')
        .values({
          id: evaluation_id,
          patient_id,
          patient_encounter_id,
          snomed_concept_id: evaluation.snomed_concept_id,
          value_snomed_concept_id: evaluation.value_snomed_concept_id,
        }),
  ).with(
    'inserting_evaluation',
    (qb) =>
      qb.insertInto('patient_evaluations')
        .values({
          id: evaluation_id,
          employment_id,
          evaluates_record_id,
          by_system: by_system || false,
        }),
  )

  function qualifierCte(
    qb: typeof query,
    qualifier: ParsedExpression,
    qualifies_record_id: string,
  ) {
    if (qualifier.type !== 'qualifier') {
      assertEquals(
        qualifier.type,
        'not',
        'we can omit not expressions upon insert, but not sure what is going on here',
      )
      return qb
    }
    const id = generateUUID()
    const id_token = id.replaceAll('-', '_')

    let next_query = qb.with(
      `inserting_qualifier_record_${id_token}`,
      (qb) =>
        qb.insertInto('patient_records')
          .values({
            id,
            patient_id,
            patient_encounter_id,
            snomed_concept_id: qualifier.snomed_concept_id,
            value_snomed_concept_id: qualifier.value_snomed_concept_id,
          }),
    ).with(
      `inserting_qualifiers_${id_token}`,
      (qb) =>
        qb.insertInto('patient_record_qualifiers')
          .values({
            id,
            qualifies_record_id,
          }),
    ) as unknown as typeof query

    for (const sub_qualifier of qualifier.qualifiers) {
      next_query = qualifierCte(
        next_query,
        sub_qualifier,
        id,
      ) as unknown as typeof query
    }

    return next_query
  }

  for (const qualifier of evaluation.qualifiers) {
    query = qualifierCte(query, qualifier, evaluation_id)
  }

  return query.selectNoFrom([
    success_true,
    sql<true>`true`.as('inserted_new'),
    literalString(evaluation_id).as('evaluation_id'),
  ])
    .executeTakeFirstOrThrow()
}

export function insertMany(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    patient_encounter_employee_id,
    evaluations,
  }: {
    patient_id: string
    patient_encounter_id: string
    patient_encounter_employee_id: string
    evaluations: VitalsEvaluation[]
  },
) {
  if (!evaluations.length) {
    return Promise.resolve({ success: true as const })
  }

  const valid_evaluations = evaluations
    .filter((evaluation) => evaluation.priority || evaluation.note?.trim())
    .map((evaluation) => ({
      id: generateUUID(),
      evaluates_record_id: evaluation.finding_id,
      snomed_concept_id:
        PRIORITY_SNOMED_CODES[evaluation.priority || 'Non-urgent'],
      note: evaluation.note?.trim(),
    }))

  if (valid_evaluations.length === 0) {
    return Promise.resolve({ success: true as const })
  }

  return trx.with(
    'inserting_evaluation_records',
    (qb) =>
      qb.insertInto('patient_records')
        .values(valid_evaluations.map((evaluation) => ({
          id: evaluation.id,
          patient_id,
          patient_encounter_id,
          snomed_concept_id: evaluation.snomed_concept_id,
        }))),
  ).with('inserting_evaluations', (qb) =>
    qb.insertInto('patient_evaluations')
      .values(valid_evaluations.map((evaluation) => ({
        id: evaluation.id,
        patient_encounter_employee_id,
        evaluates_record_id: evaluation.evaluates_record_id,
        note: evaluation.note,
        by_system: false,
      })))).selectNoFrom([
      success_true,
    ])
    .executeTakeFirstOrThrow()
}

const VITAL_SNOMED_CONCEPT_IDS = Object.values(VITALS_SNOMED_CODE)

export async function getMostRecentManualVitalsWithEvaluations(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
): Promise<
  (MostRecentVitalMeasurement & { finding_type: 'manual' })[]
> {
  const findings = await trx.with(
    'ranked_manual_findings',
    (qb) =>
      qb.selectFrom('patient_records')
        .innerJoin(
          'patient_findings',
          'patient_records.id',
          'patient_findings.id',
        )
        .innerJoin(
          'patient_measurements',
          'patient_findings.id',
          'patient_measurements.id',
        )
        .where('patient_records.patient_id', '=', patient_id)
        .where(
          'patient_records.snomed_concept_id',
          'in',
          VITAL_SNOMED_CONCEPT_IDS,
        )
        .orderBy('patient_records.created_at', 'desc')
        .selectAll('patient_records')
        .select([
          'patient_findings.patient_encounter_employee_id',
          'patient_findings.procedure_id',
          'patient_measurements.value',
          'patient_measurements.units',
        ])
        .select(sql<'manual'>`'manual'`.as('finding_type'))
        .select(
          sql`ROW_NUMBER() OVER (PARTITION BY patient_records.snomed_concept_id ORDER BY patient_records.created_at DESC)`
            .as('rank'),
        ),
  ).selectFrom('ranked_manual_findings')
    .innerJoin(
      'snomed_inferred_canonical_name_and_category',
      'ranked_manual_findings.snomed_concept_id',
      'snomed_inferred_canonical_name_and_category.id',
    )
    .where('ranked_manual_findings.rank', '=', 1)
    .select([
      'ranked_manual_findings.id as finding_id',
      'ranked_manual_findings.snomed_concept_id',
      'ranked_manual_findings.value',
      'ranked_manual_findings.units',
      'ranked_manual_findings.created_at',
      'ranked_manual_findings.patient_encounter_id',
      'ranked_manual_findings.finding_type',
      'snomed_inferred_canonical_name_and_category.name as snomed_canonical_name',
    ])
    .select((eb) => [
      jsonObjectFrom(
        patient_encounter_employees.baseQuery(trx)
          .where(
            'patient_encounter_employees.id',
            '=',
            eb.ref('ranked_manual_findings.patient_encounter_employee_id'),
          ),
      ).$notNull().as('provider'),
      jsonArrayFrom(
        eb
          .selectFrom('patient_evaluations')
          .innerJoin(
            'patient_records as evaluation_records',
            'evaluation_records.id',
            'patient_evaluations.id',
          )
          .select([
            // json_agg casts bigint to number, but when selected as a column by itself
            // kysely reads as a string so we replicate kysely's behavior here
            sql<string>`evaluation_records.snomed_concept_id::text`.as(
              'snomed_concept_id',
            ),
            sql<string | null>`null`.as('note'),
          ])
          .whereRef(
            'ranked_manual_findings.id',
            '=',
            'patient_evaluations.evaluates_record_id',
          ),
      ).as('evaluations'),
    ])
    .execute()

  return findings.map((
    { value, units, ...finding },
  ) => ({
    ...finding,
    value_display: valueDisplay({ value, units }),
  }))
}

export async function getMostRecentComputedVitalsWithEvaluations(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
): Promise<
  (MostRecentVitalMeasurement & { finding_type: 'computed' })[]
> {
  const findings = await trx.with(
    'ranked_computed_findings',
    (qb) =>
      qb.selectFrom('patient_records')
        .innerJoin(
          'patient_findings',
          'patient_records.id',
          'patient_findings.id',
        )
        .innerJoin(
          'patient_computed_findings',
          'patient_findings.id',
          'patient_computed_findings.id',
        )
        .where('patient_records.patient_id', '=', patient_id)
        .where(
          'patient_records.snomed_concept_id',
          'in',
          VITAL_SNOMED_CONCEPT_IDS,
        )
        .orderBy('patient_records.created_at', 'desc')
        .selectAll('patient_records')
        .select([
          'patient_findings.patient_encounter_employee_id',
          'patient_findings.procedure_id',
        ])
        .select([
          'patient_computed_findings.value',
          'patient_computed_findings.units',
          'patient_computed_findings.value_display',
        ])
        .select(sql<'computed'>`'computed'`.as('finding_type'))
        .select(
          sql`ROW_NUMBER() OVER (PARTITION BY patient_records.snomed_concept_id ORDER BY patient_records.created_at DESC)`
            .as('rank'),
        ),
  ).selectFrom('ranked_computed_findings')
    .innerJoin(
      'snomed_inferred_canonical_name_and_category',
      'ranked_computed_findings.snomed_concept_id',
      'snomed_inferred_canonical_name_and_category.id',
    )
    .where('ranked_computed_findings.rank', '=', 1)
    .select([
      'ranked_computed_findings.id as finding_id',
      'ranked_computed_findings.snomed_concept_id',
      'ranked_computed_findings.value',
      'ranked_computed_findings.units',
      'ranked_computed_findings.value_display',
      'ranked_computed_findings.created_at',
      'ranked_computed_findings.patient_encounter_id',
      'ranked_computed_findings.finding_type',
      'snomed_inferred_canonical_name_and_category.name as snomed_canonical_name',
    ])
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom('patient_evaluations')
          .innerJoin(
            'patient_records as evaluation_records',
            'evaluation_records.id',
            'patient_evaluations.id',
          )
          .select([
            sql<string>`evaluation_records.snomed_concept_id::text`.as(
              'snomed_concept_id',
            ),
            sql<string | null>`null`.as('note'),
          ])
          .whereRef(
            'ranked_computed_findings.id',
            '=',
            'patient_evaluations.evaluates_record_id',
          ),
      ).as('evaluations'),
    ])
    .execute()

  return findings.map((
    { value, units, value_display, ...finding },
  ) => ({
    ...finding,
    value_display: valueDisplay(
      ComputedFindingSchema.parse({ value, units, value_display }),
    ),
    provider: null,
  }))
}

// Identical to the check constraint
const ComputedFindingSchema = z.object({
  value: decimal,
  units: z.string(),
  value_display: z.null().optional(),
}).or(z.object({
  value: z.null().optional(),
  units: z.null().optional(),
  value_display: z.string(),
}))

function valueDisplay(
  { value, units, value_display }: z.infer<typeof ComputedFindingSchema>,
): string {
  if (value_display) {
    return value_display
  }

  switch (units) {
    case '°C':
    case '%':
      return `${value}${units}`
    default:
      return `${value} ${units}`
  }
}

export async function getMostRecentVitalsWithEvaluations(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
): Promise<MostRecentVitalMeasurement[]> {
  return flatten(
    await Promise.all([
      getMostRecentManualVitalsWithEvaluations(trx, { patient_id }),
      getMostRecentComputedVitalsWithEvaluations(trx, { patient_id }),
    ]),
  )
}

const CATEGORICAL_ASSESSMENT_SNOMED_CODES = [
  VITALS_SNOMED_CODE.avpu_consciousness,
  VITALS_SNOMED_CODE.mobility_assessment,
  VITALS_SNOMED_CODE.trauma_presence,
]

export async function getPreviousVitalMeasurements(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
): Promise<Map<string, string>> {
  const previous_measurements = new Map<string, string>()

  // 1. Handle new categorical assessments
  const categorical_assessments = await trx.with(
    'ranked_categorical_findings',
    (qb) =>
      qb.selectFrom('patient_records')
        .innerJoin(
          'patient_findings',
          'patient_records.id',
          'patient_findings.id',
        )
        .innerJoin(
          'patient_categorical_findings',
          'patient_findings.id',
          'patient_categorical_findings.id',
        )
        .innerJoin(
          'sats_triage_assessment_options as opt',
          'patient_records.snomed_concept_id',
          'opt.option_snomed_concept_id',
        )
        .innerJoin(
          'sats_triage_assessments as assessment',
          'opt.assessment_snomed_id',
          'assessment.assessment_snomed_id',
        )
        .where('patient_records.patient_id', '=', patient_id)
        .where('assessment.category', 'in', [
          'consciousness',
          'mobility',
          'trauma',
        ])
        .select([
          'assessment.assessment_snomed_id',
          'opt.display_label',
          'patient_records.created_at',
        ])
        .select(
          sql`ROW_NUMBER() OVER (PARTITION BY assessment.assessment_snomed_id ORDER BY patient_records.created_at DESC)`
            .as('rank'),
        ),
  ).selectFrom('ranked_categorical_findings')
    .where('rank', '=', 2)
    .select(['assessment_snomed_id', 'display_label'])
    .execute()

  for (const assessment of categorical_assessments) {
    previous_measurements.set(
      assessment.assessment_snomed_id,
      assessment.display_label,
    )
  }

  // 2. Handle other manual measurements
  const manual_measurements = await trx.with(
    'ranked_manual_findings',
    (qb) =>
      qb.selectFrom('patient_records')
        .innerJoin(
          'patient_findings',
          'patient_records.id',
          'patient_findings.id',
        )
        .innerJoin(
          'patient_measurements',
          'patient_findings.id',
          'patient_measurements.id',
        )
        .where('patient_records.patient_id', '=', patient_id)
        .where(
          'patient_records.snomed_concept_id',
          'in',
          VITAL_SNOMED_CONCEPT_IDS,
        )
        .where(
          'patient_records.snomed_concept_id',
          'not in',
          CATEGORICAL_ASSESSMENT_SNOMED_CODES,
        )
        .select([
          'patient_records.snomed_concept_id',
          'patient_measurements.value',
          'patient_measurements.units',
          'patient_records.created_at',
        ])
        .select(
          sql`ROW_NUMBER() OVER (PARTITION BY patient_records.snomed_concept_id ORDER BY patient_records.created_at DESC)`
            .as('rank'),
        ),
  ).selectFrom('ranked_manual_findings')
    .where('rank', '=', 2)
    .select(['snomed_concept_id', 'value', 'units'])
    .execute()

  for (const measurement of manual_measurements) {
    if (measurement.value !== null) {
      previous_measurements.set(
        measurement.snomed_concept_id,
        valueDisplay({ value: measurement.value, units: measurement.units }),
      )
    }
  }

  // 3. Handle computed measurements
  const computed_measurements = await trx.with(
    'ranked_computed_findings',
    (qb) =>
      qb.selectFrom('patient_records')
        .innerJoin(
          'patient_findings',
          'patient_records.id',
          'patient_findings.id',
        )
        .innerJoin(
          'patient_computed_findings',
          'patient_findings.id',
          'patient_computed_findings.id',
        )
        .where('patient_records.patient_id', '=', patient_id)
        .where(
          'patient_records.snomed_concept_id',
          'in',
          VITAL_SNOMED_CONCEPT_IDS,
        )
        .select([
          'patient_records.snomed_concept_id',
          'patient_computed_findings.value',
          'patient_computed_findings.units',
          'patient_computed_findings.value_display',
          'patient_records.created_at',
        ])
        .select(
          sql`ROW_NUMBER() OVER (PARTITION BY patient_records.snomed_concept_id ORDER BY patient_records.created_at DESC)`
            .as('rank'),
        ),
  ).selectFrom('ranked_computed_findings')
    .where('ranked_computed_findings.rank', '=', 2)
    .select(['snomed_concept_id', 'value', 'units', 'value_display'])
    .execute()

  for (const measurement of computed_measurements) {
    const display = valueDisplay(
      ComputedFindingSchema.parse({
        value: measurement.value,
        units: measurement.units,
        value_display: measurement.value_display,
      }),
    )
    previous_measurements.set(measurement.snomed_concept_id, display)
  }

  return previous_measurements
}
