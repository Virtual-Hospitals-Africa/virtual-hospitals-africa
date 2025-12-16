import { sql } from 'kysely'
import { TRIAGE_PROCEDURE_SNOMED_CONCEPT_ID } from '../../shared/patient_triage.ts'
import {
  PRIORITY_SNOMED_CODES,
  TARGET_TIME_TO_TREATMENT_MINUTES,
  TriageLevel,
  TrxOrDb,
} from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { success_true } from '../helpers.ts'

export function insertProcedure(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    // patient_encounter_employee_id,
  }: {
    patient_id: string
    patient_encounter_id: string
    patient_encounter_employee_id: string
  },
) {
  const triage_procedure_id = generateUUID()

  return trx.with(
    'inserting_record',
    (qb) =>
      qb.insertInto('patient_records')
        .values({
          id: triage_procedure_id,
          patient_id,
          patient_encounter_id,
          snomed_concept_id: TRIAGE_PROCEDURE_SNOMED_CONCEPT_ID,
        }),
  ).with('inserting_procedure', (qb) =>
    qb.insertInto('patient_procedures')
      .values({
        id: triage_procedure_id,
        // TODO probably insert this into a separate table that relates patient_records to employees
        // patient_encounter_employee_id,
      })
      .returning('id'))
    .selectFrom('inserting_procedure')
    .select([
      'id as triage_procedure_id',
      success_true,
    ])
    .executeTakeFirstOrThrow()
}

export function insertLevel(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    employment_id,
    triage_procedure_id,
    triage_level,
  }: {
    patient_id: string
    patient_encounter_id: string
    employment_id: string
    triage_procedure_id: string
    triage_level: TriageLevel
  },
) {
  const triage_level_evaluation_id = generateUUID()
  const snomed_concept_id = PRIORITY_SNOMED_CODES[triage_level]
  const target_treatment_minutes =
    TARGET_TIME_TO_TREATMENT_MINUTES[triage_level]

  return trx.with(
    'inserting_evaluation_records',
    (qb) =>
      qb.insertInto('patient_records')
        .values({
          id: triage_level_evaluation_id,
          patient_id,
          patient_encounter_id,
          snomed_concept_id,
        }),
  ).with('inserting_evaluations', (qb) =>
    qb.insertInto('patient_evaluations')
      .values({
        id: triage_level_evaluation_id,
        employment_id,
        by_system: false,
        evaluates_record_id: triage_procedure_id,
      })
      .returning('id'))
    .with(
      'inserting_triage_level',
      (qb) =>
        qb.insertInto('patient_triage_level')
          .values({
            id: triage_level_evaluation_id,
            target_treatment_time: sql`now() + interval '${
              sql.raw(target_treatment_minutes.toString())
            } minutes'`,
          })
          .returningAll(),
    )
    .selectFrom('inserting_triage_level')
    .selectAll('inserting_triage_level')
    .select([
      success_true,
    ])
    .executeTakeFirstOrThrow()
}
