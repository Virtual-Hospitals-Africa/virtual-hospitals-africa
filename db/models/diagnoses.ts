import { RenderedDoctorReview } from '../../types.ts'
import { Diagnosis, TrxOrDb } from '../../types.ts'
import { isoDate } from '../helpers.ts'

export function getFromReview(
  trx: TrxOrDb,
  { review_id }: { review_id: string },
): Promise<Diagnosis[]> {
  return trx
    .selectFrom('doctor_reviews')
    .innerJoin(
      'diagnoses',
      'diagnoses.doctor_review_id',
      'doctor_reviews.id',
    )
    .innerJoin(
      'patient_conditions',
      'patient_conditions.id',
      'diagnoses.patient_condition_id',
    )
    .innerJoin(
      'conditions',
      'conditions.id',
      'patient_conditions.condition_id',
    )
    .where('doctor_reviews.id', '=', review_id)
    .select((eb) => [
      'conditions.id',
      'conditions.name',
      isoDate(eb.ref('patient_conditions.start_date')).as('start_date'),
      'patient_conditions.id as patient_condition_id',
    ])
    .execute()
}

// @Alice @Qiyuan
// For the upsert there are 3 cases:
// 1. A diagnosis exists in the DB, but isn't in the provided data -> delete
// 2. A diagnosis exists in the DB and is in the provided data -> update
// 3. A diagnosis does not exist in the DB and is in the provided data -> insert
// Please think through how you're handling each of these cases
export async function upsertForReview(trx: TrxOrDb, {
  // @Alice @Qiyuan This has all the information we we would need about the open review, 
  // so easiest to pass in the whole thing. This comes from the context in the route.
  review, 
  diagnoses,
}: {
  review: RenderedDoctorReview
  diagnoses: {
    condition_id: string
    start_date: string
  }[]
}): Promise<void> {
  const existing_diagnoses = await getFromReview(trx, { review_id: review.review_id })

  const to_delete = existing_diagnoses.filter((existing_diagnosis) =>
    !diagnoses.some((diagnosis) => 
      existing_diagnosis.id === diagnosis.condition_id
    )
  )
  const to_update = existing_diagnoses.filter((existing_diagnosis) =>
    !diagnoses.some((diagnosis) => 
      existing_diagnosis.id === diagnosis.condition_id
    )
  )
  for (const diagnosis of diagnoses) {
    const existingPatientCondition = await trx
      .selectFrom('patient_conditions')
      .select('id')
      .where('patient_id', '=', patient_id)
      .where('condition_id', '=', diagnosis.condition_id)
      .executeTakeFirst()

    if (!existingPatientCondition) {
      const [PatientCondition] = await trx
        .insertInto('patient_conditions')
        .values({
          patient_id: patient_id,
          condition_id: diagnosis.condition_id,
          start_date: diagnosis.start_date,
        })
        .returning('id')
        .execute()

      await trx
        .insertInto('diagnoses')
        .values({
          patient_condition_id: PatientCondition.id,
          provider_id: provider_id,
          doctor_review_id: doctor_review_id,
        })
        .execute()
    }
  }
}

export async function deleteDiagnoses(trx: TrxOrDb, {
  patient_id,
  doctor_review_id,
}: {
  patient_id: string
  doctor_review_id: string
}): Promise<void> {
  const toDelete = await trx
    .selectFrom('diagnoses')
    .select('patient_condition_id')
    .where('doctor_review_id', '=', doctor_review_id)
    .where(
      'patient_condition_id',
      'in',
      trx.selectFrom('patient_conditions')
        .select('id')
        .where('patient_id', '=', patient_id),
    )
    .execute()
  const patientConditionIds = toDelete.map((row) => row.patient_condition_id)
  if (patientConditionIds.length > 0) {
    // delete data in diagnoses table
    await trx
      .deleteFrom('diagnoses')
      .where('doctor_review_id', '=', doctor_review_id)
      .where('patient_condition_id', 'in', patientConditionIds)
      .execute()
    // delete data in patient_conditions table
    await trx
      .deleteFrom('patient_conditions')
      .where('id', 'in', patientConditionIds)
      .execute()
  }
}
