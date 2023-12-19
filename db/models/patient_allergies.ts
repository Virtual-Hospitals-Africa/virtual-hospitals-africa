import { PreExistingAllergy, TrxOrDb } from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'

export async function upsert(
  trx: TrxOrDb,
  patient_id: number,
  allergies: PreExistingAllergy[],
): Promise<void> {
  assertOr400(
    allergies.length === new Set(allergies.map((item) => item.allergy_id)).size,
    'Allergy ids must be unique',
  )

  const existing_allergies = await get(trx, patient_id)

  const allergy_ids_to_remove = existing_allergies
    .map(({ id }) => id)
    .filter((id) => !allergies.some((allergy) => allergy.id === id))

  const removing_allergies = allergy_ids_to_remove.length && trx
    .deleteFrom('patient_allergies')
    .where('id', 'in', allergy_ids_to_remove)
    .execute()

  // The frontend should not be changing the details of patient allergies
  const unchanged_allergies = allergies.filter((c) => c.id)
  for (const allergy of unchanged_allergies) {
    const matching_existing_allergy = existing_allergies.find(
      (c) => c.id === allergy.id,
    )
    assertOr400(
      matching_existing_allergy,
      `No matching allergy found for id ${allergy.id}`,
    )
    assertOr400(
      matching_existing_allergy.allergy_id === allergy.allergy_id,
      `Unexpected attempt to change allergy_id for patient_allergy with id: ${allergy.id}`,
    )
  }

  const newAllergies = allergies.filter((c) => !c.id)
    .map((m) => ({ allergy_id: m.allergy_id, patient_id }))

  const adding_allergies = newAllergies.length && trx
    .insertInto('patient_allergies')
    .values(newAllergies)
    .execute()

  await Promise.all([removing_allergies, adding_allergies])
}

export function get(
  trx: TrxOrDb,
  patient_id: number,
): Promise<{
  id: number
  allergy_id: number
}[]> {
  return trx
    .selectFrom('patient_allergies')
    .where('patient_allergies.patient_id', '=', patient_id)
    .select([
      'patient_allergies.id',
      'patient_allergies.allergy_id',
    ])
    .execute()
}

export function getWithName(
  trx: TrxOrDb,
  patient_id: number,
): Promise<{
  id: number
  allergy_id: number
  name: string
}[]> {
  return trx
    .selectFrom('patient_allergies')
    .innerJoin('allergies', 'allergies.id', 'patient_allergies.allergy_id')
    .where('patient_allergies.patient_id', '=', patient_id)
    .select([
      'patient_allergies.id',
      'patient_allergies.allergy_id',
      'allergies.name',
    ])
    .execute()
}
