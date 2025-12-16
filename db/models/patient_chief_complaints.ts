import { Maybe, TrxOrDb } from '../../types.ts'
import { blankSelection, success_true } from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { markAltered, nowInvalidRecords } from './patient_records.ts'

export const EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS_SNOMED_CONCEPT_ID =
  '409060008'

export const CHIEF_COMPLAINT_SNOMED_CONCEPT_ID = '1269489004'

export const AUDIO_RECORDING_OF_SUBJECT_INTERVIEW_SNOMED_CONCEPT_ID =
  '431315003'

// // TODO: get this into a single round trip with the DB
export async function upsertOne(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    employment_id,
    patient_encounter_employee_id,
    chief_complaint,
  }: {
    patient_id: string
    patient_encounter_id: string
    employment_id: string
    patient_encounter_employee_id: string
    chief_complaint: {
      altered_patient_chief_complaint_id?: Maybe<string>
      language_code: string
      note: string
      media_speech_id?: string | undefined
    }
  },
) {
  const {
    altered_patient_chief_complaint_id,
    language_code,
    note,
    media_speech_id,
  } = chief_complaint

  if (altered_patient_chief_complaint_id) {
    await markAltered(trx, {
      patient_id,
      patient_encounter_id,
      employment_id,
      altered_record_id: altered_patient_chief_complaint_id,
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
      'patient_records.snomed_concept_id',
      '=',
      EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS_SNOMED_CONCEPT_ID,
    )
    .select(['patient_procedures.id'])
    .executeTakeFirst()

  const procedure_id = existing_procedure?.id || generateUUID()
  const speech_record_id = media_speech_id && generateUUID()

  const chief_complaint_id = generateUUID()

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
        id: chief_complaint_id,
        patient_id,
        patient_encounter_id,
        snomed_concept_id: CHIEF_COMPLAINT_SNOMED_CONCEPT_ID,
      })).with('inserting_findings', (qb) =>
      qb.insertInto('patient_findings')
        .values({
          id: chief_complaint_id,
          procedure_id,
          patient_encounter_employee_id,
        }))
    .with(
      'inserting_chief_complaint',
      (qb) =>
        qb.insertInto('patient_chief_complaints')
          .values({
            id: chief_complaint_id,
            note,
            language_code,
          }),
    )
    .with(
      'inserting_speech_record',
      (qb) =>
        speech_record_id
          ? qb.insertInto('patient_records')
            .values({
              id: speech_record_id,
              patient_id,
              patient_encounter_id,
              snomed_concept_id:
                AUDIO_RECORDING_OF_SUBJECT_INTERVIEW_SNOMED_CONCEPT_ID,
            })
          : blankSelection(qb),
    )
    .with(
      'inserting_speech_finding',
      (qb) =>
        speech_record_id
          ? qb.insertInto('patient_findings')
            .values({
              id: speech_record_id,
              patient_encounter_employee_id,
              procedure_id,
            })
          : blankSelection(qb),
    )
    .with(
      'inserting_speech_finding_media_speech',
      (qb) =>
        speech_record_id
          ? qb.insertInto('patient_finding_media_speeches')
            .values({
              id: speech_record_id,
              finding_id: chief_complaint_id,
              media_speech_id,
            })
          : blankSelection(qb),
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
) {
  return trx
    .selectFrom('patient_records')
    .innerJoin(
      'patient_findings',
      'patient_findings.id',
      'patient_records.id',
    )
    .innerJoin(
      'patient_chief_complaints',
      'patient_chief_complaints.id',
      'patient_findings.id',
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
    .leftJoin(
      'patient_finding_media_speeches',
      'patient_finding_media_speeches.finding_id',
      'patient_chief_complaints.id',
    )
    .selectAll('patient_records')
    .select([
      'patient_chief_complaints.id',
      'snomed_inferred_canonical_name_and_category.name',
      // 'patient_finding_media_speeches.id as media_speech_id',
      // 'patient_finding_media_speeches.media_speech_id',
      // 'patient_finding_media_speeches.language_code',
      // 'patient_finding_media_speeches.note',
    ]).executeTakeFirst()
}
