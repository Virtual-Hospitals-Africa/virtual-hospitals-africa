import { PreExistingAllergy, TrxOrDb } from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'
export async function upsertAllergies(
  trx: TrxOrDb,
  patient_id: number,
  allergies: PreExistingAllergy[]
) {
  assertOr400(
    allergies.length === new Set(allergies.map((item) => item.allergy_id)).size,
    'Allergy ids must be unique'
  )

  const dbAllergies = await getPatientAllergies(trx, patient_id)

  const removedAllergies = allergies.filter(c=> c.removed).map(c=> c.id!)

  removedAllergies.length && assertOr400(
       dbAllergies.some(c=> removedAllergies.includes(c.id!)),
      'Can`t remove patient allergy, invalid Id!'
    ) 

  removedAllergies.length &&
    trx
      .deleteFrom('patient_allergies')
      .where('id', 'in', removedAllergies)
      .execute()

  const newAllergies = allergies.filter(c=> !c.id)
    .map((m) => ({ allergy_id: m.allergy_id, patient_id }))

  newAllergies.length &&
    (await trx
      .insertInto('patient_allergies')
      .values(newAllergies)
      .executeTakeFirstOrThrow())
}

export async function getPatientAllergies(
  trx: TrxOrDb,
  patient_id: number
): Promise<PreExistingAllergy[]> {
  return await trx
    .selectFrom('patient_allergies')
    .where('patient_allergies.patient_id', '=', patient_id)
    .select(['id', 'allergy_id'])
    .execute()
}
