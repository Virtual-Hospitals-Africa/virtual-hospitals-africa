import { Maybe, TrxOrDb } from '../../types.ts'
import { blankSelection, success_true } from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { markAltered } from './patient_records_base.ts'
import {
  AUDIO_RECORDING_OF_SUBJECT_INTERVIEW,
  CHIEF_COMPLAINT,
  CLINICAL_FINDING,
  EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS,
  PROCEDURE,
} from '../../shared/snomed_concepts.ts'

export const patient_chief_complaints = {
  // // TODO: get this into a single round trip with the DB
  async upsertOne(
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
        'patient_records.specific_snomed_concept_id',
        '=',
        EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS.id,
      )
      .select(['patient_procedures.id'])
      .executeTakeFirst()

    const procedure_id = existing_procedure?.id || generateUUID()
    const speech_record_id = media_speech_id && generateUUID()

    const chief_complaint_id = generateUUID()

    if (altered_patient_chief_complaint_id) {
      await markAltered(trx, {
        patient_id,
        patient_encounter_id,
        employment_id,
        procedure_id,
        altered_record_ids: [altered_patient_chief_complaint_id],
      })
    }

    return trx.with(
      'inserting_procedure_record',
      (qb) =>
        !existing_procedure
          ? qb.insertInto('patient_records')
            .values({
              id: procedure_id,
              patient_id,
              patient_encounter_id,
              root_snomed_concept_id: PROCEDURE.id,
              specific_snomed_concept_id: EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS
                .id,
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
            })
          : blankSelection(qb),
    ).with('inserting_finding_records', (qb) =>
      qb.insertInto('patient_records')
        .values({
          id: chief_complaint_id,
          patient_id,
          patient_encounter_id,
          // TODO: pick a better concept?
          root_snomed_concept_id: CLINICAL_FINDING.id,
          specific_snomed_concept_id: CHIEF_COMPLAINT.id,
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
                // TODO pick a better concept?
                root_snomed_concept_id: CLINICAL_FINDING.id,
                specific_snomed_concept_id: AUDIO_RECORDING_OF_SUBJECT_INTERVIEW.id,
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
  },
  getEncounter(
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
      .innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_records.id')
      .innerJoin(
        'patient_chief_complaints',
        'patient_chief_complaints.id',
        'patient_findings.id',
      )
      .innerJoin(
        'snomed_inferred_canonical_name_and_category',
        'patient_records.specific_snomed_concept_id',
        'snomed_inferred_canonical_name_and_category.id',
      )
      .where('patient_records.patient_id', '=', patient_id)
      .where('patient_records.patient_encounter_id', '=', patient_encounter_id)
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
  },
}
