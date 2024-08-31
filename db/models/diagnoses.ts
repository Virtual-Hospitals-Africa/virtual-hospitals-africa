import {
Diagnosis,
  TrxOrDb,
} from '../../types.ts'
import { isoDate } from '../helpers.ts'

export async function getFromActiveReview(trx: TrxOrDb, { patient_id }: { patient_id: string }): Promise<Diagnosis[]> {
  //throw new Error('To Implement')
  // Start with patient conditions table
  // then join through the diagnoses table,
  // then join through the doctor_reviews table,
  const diagnoses = await trx
    .selectFrom('patient_conditions')
    .innerJoin(
      'diagnoses', 
      'patient_conditions.id', 
      'diagnoses.patient_condition_id')
    .innerJoin(
      'doctor_reviews', 
      'diagnoses.doctor_reviews_id', 
      'doctor_reviews.id')
    .innerJoin(
      'conditions',
      'conditions.id',
      'patient_conditions.condition_id',
    )
    .where('patient_conditions.patient_id', '=', patient_id)
    .select((eb) => [
      'conditions.id',
      'conditions.name',
      isoDate(eb.ref('patient_conditions.start_date')).as('start_date'),
      'patient_conditions.id as patient_condition_id',
    ])
    .execute()
  return diagnoses
}

export async function upsert(trx: TrxOrDb, {
  patient_id,
  diagnoses,
  provider_id,
  doctor_reviews_id,
}: {
  patient_id: string
  provider_id: string
  doctor_reviews_id: string
  diagnoses: {
    condition_id: string
    start_date: string
  }[]
}): Promise<void> {
  //throw new Error('To Implement')
  for (const diagnosis of diagnoses) {
    // check if the data is already in patient_condition table
    const existingPatientCondition = await trx
      .selectFrom('patient_conditions')
      .select('id')
      .where('patient_id', '=', patient_id)
      .where('condition_id', '=', diagnosis.condition_id)
      .executeTakeFirst();

    if (!existingPatientCondition) {
      const [PatientCondition] = await trx
        .insertInto('patient_conditions')
        .values({
          patient_id: patient_id,
          condition_id: diagnosis.condition_id,
          start_date: diagnosis.start_date,
        })
        .returning('id')
        .execute();

      await trx
        .insertInto('diagnoses')
        .values({
          patient_condition_id: PatientCondition.id,
          provider_id: provider_id,
          doctor_reviews_id: doctor_reviews_id,
        })
        .execute();
    } 
  }
}

export async function deleteDiagnoses(trx: TrxOrDb, {
  patient_id,
  doctor_reviews_id,
}: {
  patient_id: string
  doctor_reviews_id: string
}): Promise<void> {

  const toDelete = await trx
    .selectFrom('diagnoses')
    .select('patient_condition_id')
    .where('doctor_reviews_id', '=', doctor_reviews_id)
    .where('patient_condition_id', 'in',
      trx.selectFrom('patient_conditions')
        .select('id')
        .where('patient_id', '=', patient_id)
    )
    .execute()
  const patientConditionIds = toDelete.map(row => row.patient_condition_id)
  if (patientConditionIds.length > 0) {
    // delete data in diagnoses table
    await trx
      .deleteFrom('diagnoses')
      .where('doctor_reviews_id', '=', doctor_reviews_id)
      .where('patient_condition_id', 'in', patientConditionIds)
      .execute()
    // delete data in patient_conditions table
    await trx
      .deleteFrom('patient_conditions')
      .where('id', 'in', patientConditionIds)
      .execute()
  }
}
