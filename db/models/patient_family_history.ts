import { sql } from 'kysely'
import {
  PatientFamilyHistoryUpsert,
  RenderedPatientFamilyHistory,
  TrxOrDb,
} from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { blankSelection, success_true } from '../helpers.ts'
import { markAltered, nowInvalidRecords } from './patient_records.ts'

export const PATIENT_FAMILY_HISTORY_TAKING_SNOMED_CONCEPT_ID = '410551005'

// TODO: get this into a single round trip with the DB
export async function upsertOne(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    patient_encounter_employee_id,
    family_history,
  }: {
    patient_id: string
    patient_encounter_id: string
    patient_encounter_employee_id: string
    family_history: PatientFamilyHistoryUpsert
  },
) {
  const {
    altered_patient_family_history_id,
    snomed_concept_id,
    // TODO use this and other fields related
    // relation_gendered,
  } = family_history

  if (altered_patient_family_history_id) {
    await markAltered(trx, {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      altered_record_id: altered_patient_family_history_id,
    })
  }

  const existing_procedure = await trx.selectFrom('patient_records')
    .innerJoin(
      'patient_procedures',
      'patient_records.id',
      'patient_procedures.id',
    )
    .where(
      'patient_records.patient_id',
      '=',
      patient_id,
    )
    .where(
      'patient_records.patient_encounter_id',
      '=',
      patient_encounter_id,
    )
    .where(
      'patient_procedures.patient_encounter_employee_id',
      '=',
      patient_encounter_employee_id,
    )
    .where(
      'patient_records.snomed_concept_id',
      '=',
      PATIENT_FAMILY_HISTORY_TAKING_SNOMED_CONCEPT_ID,
    )
    .select(['patient_procedures.id'])
    .executeTakeFirst()

  const procedure_id = existing_procedure?.id || generateUUID()

  const family_history_id = generateUUID()

  return trx.with(
    'inserting_procedure_record',
    (qb) =>
      !existing_procedure
        ? qb.insertInto('patient_records')
          .values({
            id: procedure_id,
            patient_id,
            patient_encounter_id,
            snomed_concept_id: PATIENT_FAMILY_HISTORY_TAKING_SNOMED_CONCEPT_ID,
          })
        : blankSelection(qb),
  ).with(
    'inserting_procedure',
    (qb) =>
      !existing_procedure
        ? qb.insertInto('patient_procedures')
          .values({
            id: procedure_id,
            patient_encounter_employee_id,
          })
        : blankSelection(qb),
  ).with('inserting_finding_records', (qb) =>
    qb.insertInto('patient_records')
      .values({
        id: family_history_id,
        patient_id,
        patient_encounter_id,
        snomed_concept_id,
      })).with('inserting_findings', (qb) =>
      qb.insertInto('patient_findings')
        .values({
          id: family_history_id,
          procedure_id,
          patient_encounter_employee_id,
        }))
    // .with(
    //   'inserting_family_historys',
    //   (qb) =>
    //     qb.insertInto('patient_family_historys')
    //       .values({
    //         id: family_history_id,
    //         severity,
    //         start_date,
    //         end_date,
    //         notes,
    //       }),
    // )
    .selectNoFrom([
      success_true,
    ])
    .executeTakeFirstOrThrow()
}

export function getEncounter(
  trx: TrxOrDb,
  { patient_id, patient_encounter_id }: {
    patient_id: string
    patient_encounter_id: string
  },
): Promise<RenderedPatientFamilyHistory[]> {
  return trx
    .selectFrom('patient_records')
    .innerJoin(
      'patient_findings',
      'patient_findings.id',
      'patient_records.id',
    )
    .innerJoin(
      'snomed_inferred_canonical_name_and_category',
      'patient_records.snomed_concept_id',
      'snomed_inferred_canonical_name_and_category.id',
    )
    .where('patient_records.patient_id', '=', patient_id)
    .where('patient_records.patient_encounter_id', '=', patient_encounter_id)
    .where(
      'patient_records.id',
      'not in',
      nowInvalidRecords(trx, { patient_id }),
    )
    .selectAll('patient_records')
    .select([
      'patient_findings.id',
      'patient_records.snomed_concept_id',
      'snomed_inferred_canonical_name_and_category.name',
      // TODO actually map this
      sql<string>`'daughter'`.as('relation_gendered'),
    ]).execute()
}
