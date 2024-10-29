import { sql as rawSql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { DiagnosisGroup, TrxOrDb } from '../../types.ts'
import partition from '../../util/partition.ts'
import { isoDate } from '../helpers.ts'

export async function getFromReview(
  trx: TrxOrDb,
  {
    review_id,
    encounter_id,
    employment_id,
  }: {
    employment_id: string
    encounter_id: string
    review_id?: string
  },
): Promise<DiagnosisGroup> {
  let sql = trx
    .selectFrom('diagnoses')
    .innerJoin(
      'patient_conditions',
      'patient_conditions.id',
      'diagnoses.patient_condition_id',
    )
    .innerJoin('conditions', 'conditions.id', 'patient_conditions.condition_id')
    .innerJoin('employment', 'diagnoses.provider_id', 'employment.id')
    .innerJoin(
      'health_workers',
      'employment.health_worker_id',
      'health_workers.id',
    )
    .leftJoin(
      'diagnoses_collaboration',
      'diagnoses.id',
      'diagnoses_collaboration.diagnosis_id',
    )

  if (review_id && encounter_id) {
    sql = sql.where((eb) =>
      eb.or([
        eb('diagnoses.doctor_review_id', '=', review_id),
        eb('diagnoses.patient_encounter_id', '=', encounter_id),
      ])
    )
  }
  if (encounter_id && !review_id) {
    sql = sql.where('diagnoses.patient_encounter_id', '=', encounter_id)
  }

  const diagnoses = await sql
    .select((eb) => [
      'conditions.id',
      'conditions.name',
      'diagnoses.patient_condition_id',
      'diagnoses.provider_id',
      'diagnoses.id as diagnosis_id',
      'health_workers.name as diagnosed_by',
      isoDate(eb.ref('patient_conditions.start_date')).as('start_date'),
      isoDate(eb.ref('diagnoses.updated_at')).as('diagnosed_at'),
      'diagnoses_collaboration.approver_id as approval_by',
      'diagnoses_collaboration.disagree_reason',
      rawSql<'agree' | 'disagree'>`CASE 
          WHEN diagnoses_collaboration.is_approved = true THEN 'agree' 
          WHEN diagnoses_collaboration.is_approved = false THEN 'disagree' 
          ELSE null 
        END`.as('approval'),
    ])
    .execute()

  return {
    self: diagnoses.filter((d) => d.provider_id === employment_id),
    others: diagnoses.filter((d) => d.provider_id !== employment_id),
  }
}

export async function upsertForReview(
  trx: TrxOrDb,
  {
    review_id,
    encounter_id,
    patient_id,
    employment_id,
    diagnoses,
    diagnoses_collaborations,
  }: {
    patient_id: string
    employment_id: string
    diagnoses: {
      condition_id: string
      start_date: string
    }[]
    diagnoses_collaborations: {
      diagnosis_id: string
      is_approved: boolean
      disagree_reason: null | string
    }[]
    encounter_id: string
    review_id?: string
  },
): Promise<void> {
  const existing_diagnoses = await getFromReview(trx, {
    review_id,
    employment_id,
    encounter_id,
  })

  const [to_update_diagnoses, to_insert_diagnoses] = partition(
    diagnoses,
    (diagnosis) =>
      existing_diagnoses.self.some(
        (existing_diagnosis) =>
          existing_diagnosis.id === diagnosis.condition_id,
      ),
  )
  const [to_update_collaborations, to_insert_collaborations] = partition(
    diagnoses_collaborations,
    (diagnoses_collaboration) =>
      existing_diagnoses.others.some(
        (existing_diagnoses_collaboration) =>
          existing_diagnoses_collaboration.diagnosis_id ===
            diagnoses_collaboration.diagnosis_id &&
          !!existing_diagnoses_collaboration.approval_by,
      ),
  )

  const inserting_collaborations = to_insert_collaborations.length &&
    Promise.all(
      to_insert_collaborations.map(async (d) => {
        await trx
          .insertInto('diagnoses_collaboration')
          .values({
            ...d,
            approver_id: employment_id,
          })
          .execute()
      }),
    )

  const to_delete_diagnoses = existing_diagnoses.self.filter(
    (existing_diagnosis) =>
      !diagnoses.some(
        (diagnosis) => existing_diagnosis.id === diagnosis.condition_id,
      ),
  )

  const deleting_diagnoses = to_delete_diagnoses.length &&
    trx
      .deleteFrom('patient_conditions')
      .where(
        'id',
        'in',
        to_delete_diagnoses.map((diagnosis) => diagnosis.patient_condition_id),
      )
      .execute()

  console.log('await deleting')
  await deleting_diagnoses

  const isInDoctorReview = review_id !== undefined

  const inserting_diagnoses = to_insert_diagnoses.length &&
    Promise.all(
      to_insert_diagnoses.map(async (d) => {
        const { id: patient_condition_id } = await trx
          .insertInto('patient_conditions')
          .values({
            patient_id,
            condition_id: d.condition_id,
            start_date: d.start_date,
          })
          .returning('id')
          .executeTakeFirstOrThrow()

        await trx
          .insertInto('diagnoses')
          .values({
            patient_condition_id,
            provider_id: employment_id,
            ...(isInDoctorReview && { doctor_review_id: review_id }),
            ...(!isInDoctorReview && { patient_encounter_id: encounter_id }),
          })
          .execute()
      }),
    )

  console.log('await inserting')
  await inserting_diagnoses
  console.log('sweklkwlelkew inserting')

  const updating_diagnoses = Promise.all(
    to_update_diagnoses.map((d) => {
      const matching_diagnosis = existing_diagnoses.self.find(
        (existing_diagnosis) => existing_diagnosis.id === d.condition_id,
      )
      assert(matching_diagnosis, 'matching_diagnosis should exist')
      if (matching_diagnosis.start_date !== d.start_date) {
        return trx
          .updateTable('patient_conditions')
          .set('start_date', d.start_date)
          .where('id', '=', matching_diagnosis.patient_condition_id)
          .execute()
      }
    }),
  )

  const updating_collaborations = to_update_collaborations.length &&
    Promise.all(
      to_update_collaborations.map((d) => {
        const matching_diagnoses_collaboration = existing_diagnoses.others.find(
          (existing_diagnoses_collaboration) =>
            existing_diagnoses_collaboration.diagnosis_id === d.diagnosis_id,
        )
        assert(
          matching_diagnoses_collaboration,
          'matching_diagnoses_collaboration should exist',
        )
        return trx
          .updateTable('diagnoses_collaboration')
          .set('is_approved', d.is_approved)
          .set('disagree_reason', d.disagree_reason)
          .where(
            'diagnosis_id',
            '=',
            matching_diagnoses_collaboration.diagnosis_id,
          )
          .where('approver_id', '=', employment_id)
          .execute()
      }),
    )

  await Promise.all([
    deleting_diagnoses,
    inserting_diagnoses,
    updating_diagnoses,
    inserting_collaborations,
    updating_collaborations,
  ])
}
