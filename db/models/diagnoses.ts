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
      'health_workers.name as diagnosed_by',
      isoDate(eb.ref('patient_conditions.start_date')).as('start_date'),
      isoDate(eb.ref('diagnoses.updated_at')).as('diagnosed_at'),
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
  }: {
    patient_id: string
    employment_id: string
    diagnoses: {
      condition_id: string
      start_date: string
    }[]
    encounter_id: string
    review_id?: string
  },
): Promise<void> {
  let existing_diagnoses: DiagnosisGroup = {
    self: [],
    others: [],
  }

  existing_diagnoses = await getFromReview(trx, {
    review_id,
    employment_id,
    encounter_id,
  })

  const [to_update, to_insert] = partition(
    diagnoses,
    (diagnosis) =>
      existing_diagnoses.self.some(
        (existing_diagnosis) =>
          existing_diagnosis.id === diagnosis.condition_id,
      ),
  )

  const to_delete = existing_diagnoses.self.filter(
    (existing_diagnosis) =>
      !diagnoses.some(
        (diagnosis) => existing_diagnosis.id === diagnosis.condition_id,
      ),
  )

  const deleting = to_delete.length &&
    trx
      .deleteFrom('patient_conditions')
      .where(
        'id',
        'in',
        to_delete.map((diagnosis) => diagnosis.patient_condition_id),
      )
      .execute()

  console.log('await deleting')
  await deleting

  const isInDoctorReview = review_id !== undefined

  const inserting = to_insert.length &&
    Promise.all(
      to_insert.map(async (d) => {
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
  await inserting
  console.log('sweklkwlelkew inserting')

  const updating = Promise.all(
    to_update.map((d) => {
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

  await Promise.all([deleting, inserting, updating])
}
