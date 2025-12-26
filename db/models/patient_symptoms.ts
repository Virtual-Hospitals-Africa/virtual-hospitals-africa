import { sql } from 'kysely'
import {
  PatientSymptomUpsert,
  RenderedPatientSymptom,
  TrxOrDb,
} from '../../types.ts'
import {
  blankSelection,
  isoDate,
  jsonArrayFrom,
  success_true,
} from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { markAltered, nowInvalidRecords } from './patient_records.ts'

export const EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS_SNOMED_CONCEPT_ID =
  '409060008'

export const FINDING_REPORTED_BY_SUBJECT_OR_HISTORY_PROVIDER_SNOMED_CONCEPT_ID =
  '418799008' // |Finding reported by subject or history provider (finding)|

// TODO: get this into a single round trip with the DB
export async function upsertOne(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    employment_id,
    patient_encounter_employee_id,
    symptom,
  }: {
    patient_id: string
    patient_encounter_id: string
    employment_id: string
    patient_encounter_employee_id: string
    symptom: PatientSymptomUpsert
  },
) {
  const {
    altered_patient_symptom_id,
    snomed_concept_id,
    severity,
    start_date,
    end_date,
    notes,
  } = symptom

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
      'patient_records.snomed_concept_id',
      '=',
      EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS_SNOMED_CONCEPT_ID,
    )
    .select(['patient_procedures.id'])
    .executeTakeFirst()

  const procedure_id = existing_procedure?.id || generateUUID()

  if (altered_patient_symptom_id) {
    await markAltered(trx, {
      patient_id,
      patient_encounter_id,
      employment_id,
      procedure_id,
      altered_record_id: altered_patient_symptom_id,
    })
  }

  const symptom_id = generateUUID()

  return trx.with(
    'inserting_procedure_record',
    (qb) =>
      !existing_procedure
        ? qb.insertInto('patient_records')
          .values({
            id: procedure_id,
            patient_id,
            patient_encounter_id,
            snomed_concept_id:
              EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS_SNOMED_CONCEPT_ID,
          })
        : blankSelection(qb),
  ).with(
    'inserting_procedure',
    (qb) =>
      !existing_procedure
        ? qb.insertInto('patient_procedures')
          .values({
            id: procedure_id,
            employment_id,
            by_system: false,
          })
        : blankSelection(qb),
  ).with('inserting_finding_records', (qb) =>
    qb.insertInto('patient_records')
      .values({
        id: symptom_id,
        patient_id,
        patient_encounter_id,
        snomed_concept_id:
          FINDING_REPORTED_BY_SUBJECT_OR_HISTORY_PROVIDER_SNOMED_CONCEPT_ID,
      })).with('inserting_findings', (qb) =>
      qb.insertInto('patient_findings')
        .values({
          id: symptom_id,
          procedure_id,
          patient_encounter_employee_id,
          finding_snomed_concept_id: snomed_concept_id,
        })).with(
      'inserting_symptoms',
      (qb) =>
        qb.insertInto('patient_symptoms')
          .values({
            id: symptom_id,
            severity,
            start_date,
            end_date,
            notes,
          }),
    )
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
): Promise<RenderedPatientSymptom[]> {
  return trx
    .selectFrom('patient_records')
    .innerJoin(
      'patient_symptoms',
      'patient_symptoms.id',
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
    .select((eb) => [
      'patient_symptoms.id',
      'severity',
      'notes',
      'snomed_inferred_canonical_name_and_category.name',
      isoDate(eb.ref('start_date')).as('start_date'),
      isoDate(eb.ref('end_date')).as('end_date'),
      jsonArrayFrom(
        eb
          .selectFrom('patient_finding_media_images')
          .innerJoin(
            'media',
            'media.id',
            'patient_finding_media_images.media_image_id',
          )
          .select([
            'media.mime_type',
            sql<string>`concat('/app/media/', media.uuid)`.as('url'),
          ])
          .whereRef(
            'patient_finding_media_images.finding_id',
            '=',
            'patient_symptoms.id',
          ),
      ).as('media'),
    ]).execute()
}
