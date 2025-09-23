/*
  Treat patient_records and all its related tables as append only logs
  Deletions would be handled by making a `referrant_finding` with snomed_concept_id: 723510000 | Entered in error
  Edits would be a deletion and a new entry
*/
import { sql } from 'kysely'
import {
  ExtantProcedureOrCreationIntent,
  Measurement,
  MostRecentVitalMeasurement,
  PRIORITY_SNOMED_CODES,
  TrxOrDb,
} from '../../types.ts'
import {
  blankSelection,
  jsonArrayFrom,
  jsonBuildObject,
  literalString,
  success_true,
} from '../helpers.ts'
import z from 'zod'
import { decimal } from '../../util/validators.ts'
import compact from '../../util/compact.ts'
import generateUUID from '../../util/uuid.ts'
import { assert } from 'std/assert/assert.ts'

export function insertMany(
  trx: TrxOrDb,
  {
    input_measurements,
    patient_id,
    patient_encounter_id,
    procedure,
    patient_encounter_employee_id,
  }: {
    patient_id: string
    patient_encounter_id: string
    patient_encounter_employee_id: string
    procedure: ExtantProcedureOrCreationIntent
    input_measurements: Measurement[]
  },
): Promise<{ success: true; procedure_id: string }> {
  assert(
    input_measurements.length,
    'Input measurements are required. Check upstream',
  )

  const procedure_id = procedure.id || generateUUID()

  const evaluations = compact(
    input_measurements.map(({ finding_id, evaluation }) => (
      evaluation && ({
        id: generateUUID(),
        evaluates_record_id: finding_id,
        snomed_concept_id: PRIORITY_SNOMED_CODES[evaluation.priority],
        note: evaluation.note,
      })
    )),
  )

  return trx.with(
    'inserting_procedure_record',
    (qb) =>
      procedure.create_from_snomed_concept_id
        ? qb.insertInto('patient_records')
          .values({
            id: procedure_id,
            patient_id,
            patient_encounter_id,
            snomed_concept_id: procedure.create_from_snomed_concept_id,
          })
        : blankSelection(qb),
  ).with(
    'inserting_procedure',
    (qb) =>
      procedure.create_from_snomed_concept_id
        ? qb.insertInto('patient_procedures')
          .values({
            id: procedure_id,
            patient_encounter_employee_id,
          })
        : blankSelection(qb),
  ).with('inserting_finding_records', (qb) =>
    qb.insertInto('patient_records')
      .values(input_measurements.map(
        (input_measurement) => ({
          id: input_measurement.finding_id,
          patient_id,
          patient_encounter_id,
          snomed_concept_id: input_measurement.snomed_concept_id,
        }),
      ))).with('inserting_findings', (qb) =>
      qb.insertInto('patient_findings')
        .values(input_measurements.map(
          (input_measurement) => ({
            id: input_measurement.finding_id,
            procedure_id,
            patient_encounter_employee_id,
          }),
        ))).with(
      'inserting_measurements',
      (qb) =>
        qb.insertInto('patient_measurements')
          .values(input_measurements.map(
            (input_measurement) => ({
              id: input_measurement.finding_id,
              value: input_measurement.value,
              units: input_measurement.units,
            }),
          )),
    ).with(
      'inserting_priority_evaluation_records',
      (qb) =>
        evaluations.length
          ? qb.insertInto('patient_records')
            .values(evaluations.map((evaluation) => ({
              id: evaluation.id,
              snomed_concept_id: evaluation.snomed_concept_id,
              patient_id,
              patient_encounter_id,
            })))
          : blankSelection(qb),
    ).with(
      'inserting_priority_evaluations',
      (qb) =>
        evaluations.length
          ? qb.insertInto('patient_evaluations')
            .values(evaluations.map((evaluation) => ({
              patient_encounter_employee_id,
              id: evaluation.id,
              evaluates_record_id: evaluation.evaluates_record_id,
              note: evaluation.note,
              by_system: false,
            })))
          : blankSelection(qb),
    ).selectNoFrom([
      success_true,
      literalString(procedure_id).as('procedure_id'),
    ])
    .executeTakeFirstOrThrow()
}

const MeasurementSchema = z.object({
  value: decimal,
  units: z.enum([
    'cm',
    'kg',
    '°C',
    'mmHg',
    '%',
    'mg/dL',
    'bpm',
    'kg/m²', // BMI units
  ]),
})

function valueDisplay(
  { value, units }: z.infer<typeof MeasurementSchema>,
): string {
  switch (units) {
    case '°C':
    case '%':
      return `${value}${units}`
    default:
      return `${value} ${units}`
  }
}

export async function getMostRecent(
  trx: TrxOrDb,
  { patient_id, snomed_concept_ids }: {
    patient_id: string
    snomed_concept_ids: string[]
  },
): Promise<MostRecentVitalMeasurement[]> {
  const findings = await trx.with(
    'ranked_findings',
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
        .where('patient_records.snomed_concept_id', 'in', snomed_concept_ids)
        .orderBy('patient_records.created_at', 'desc')
        .selectAll('patient_records')
        .select([
          'patient_findings.patient_encounter_employee_id',
          'patient_findings.procedure_id',
          'patient_findings.referent_finding_id',
        ])
        .select([
          'patient_measurements.value',
          'patient_measurements.units',
        ])
        .select(
          sql`ROW_NUMBER() OVER (PARTITION BY snomed_concept_id ORDER BY created_at DESC)`
            .as('rank'),
        ),
  ).selectFrom('ranked_findings')
    .innerJoin(
      'patient_encounter_employees',
      'patient_encounter_employees.id',
      'ranked_findings.patient_encounter_employee_id',
    )
    .innerJoin(
      'employment',
      'employment.id',
      'patient_encounter_employees.employment_id',
    )
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .innerJoin(
      'organizations',
      'organizations.id',
      'employment.organization_id',
    )
    .where('ranked_findings.rank', '=', 1)
    .select([
      'ranked_findings.id as finding_id',
      'ranked_findings.snomed_concept_id',
      'ranked_findings.value',
      'ranked_findings.units',
      'ranked_findings.created_at',
      'ranked_findings.patient_encounter_id',
    ])
    .select(sql<'manual'>`'manual'`.as('finding_type'))
    .select((eb) => [
      jsonBuildObject({
        name: eb.ref('health_workers.name'),
        avatar_url: eb.ref('health_workers.avatar_url'),
        profession: eb.ref('employment.profession').$castTo<
          'doctor' | 'nurse'
        >(),
        patient_encounter_employee_id: eb.ref('patient_encounter_employees.id'),
        organization: jsonBuildObject({
          id: eb.ref('organizations.id'),
          name: eb.ref('organizations.name'),
        }),
        employee_id: eb.ref('employment.id'),
        health_worker_id: eb.ref('health_workers.id'),
      }).as('provider'),
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
            'note',
          ])
          .whereRef(
            'ranked_findings.id',
            '=',
            'patient_evaluations.evaluates_record_id',
          ),
      ).as('evaluations'),
    ])
    .execute()

  return findings.map(({ value, units, ...finding }) => ({
    ...finding,
    value_display: valueDisplay(
      MeasurementSchema.parse({ value, units }),
    ),
  }))
}
