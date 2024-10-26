import { assert } from 'std/assert/assert.ts'
import { Diagnosis, RenderedDoctorReview, TrxOrDb } from '../../types.ts'
import partition from '../../util/partition.ts'
import { isoDate } from '../helpers.ts'

export function getFromReview(
  trx: TrxOrDb,
  {
    review_id,
    encounter_id,
  }:
    | {
      review_id: string
      encounter_id?: string
    }
    | {
      review_id?: string
      encounter_id: string
    },
): Promise<Diagnosis[]> {
  let sql = trx
    .selectFrom('diagnoses')
    .innerJoin(
      'patient_conditions',
      'patient_conditions.id',
      'diagnoses.patient_condition_id',
    )
    .innerJoin('conditions', 'conditions.id', 'patient_conditions.condition_id')

  if (review_id) {
    sql = sql.where('diagnoses.doctor_review_id', '=', review_id)
  }
  if (encounter_id) {
    sql = sql.where('diagnoses.patient_encounter_id', '=', encounter_id)
  }

  return sql.select((eb) => [
    'conditions.id',
    'conditions.name',
    'diagnoses.patient_condition_id',
    isoDate(eb.ref('patient_conditions.start_date')).as('start_date'),
  ])
    .execute()
}

export async function upsertForReview(
  trx: TrxOrDb,
  {
    review_id,
    encounter_id,
    patient_id,
    employment_id,
    diagnoses,
  }:
    & {
      patient_id: string
      employment_id: string
      diagnoses: {
        condition_id: string
        start_date: string
      }[]
    }
    & (
      | {
        review_id: string
        encounter_id?: string
      }
      | {
        review_id?: string
        encounter_id: string
      }
    ),
): Promise<void> {
  let existing_diagnoses: Diagnosis[] = []
  if (review_id) existing_diagnoses = await getFromReview(trx, { review_id })
  if (encounter_id) {
    existing_diagnoses = await getFromReview(trx, { encounter_id })
  }

  const [to_update, to_insert] = partition(
    diagnoses,
    (diagnosis) =>
      existing_diagnoses.some(
        (existing_diagnosis) =>
          existing_diagnosis.id === diagnosis.condition_id,
      ),
  )

  const to_delete = existing_diagnoses.filter(
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
            doctor_review_id: review_id,
            patient_encounter_id: encounter_id,
          })
          .execute()
      }),
    )

  console.log('await inserting')
  await inserting
  console.log('sweklkwlelkew inserting')

  const updating = Promise.all(
    to_update.map((d) => {
      const matching_diagnosis = existing_diagnoses.find(
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
