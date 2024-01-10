import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'

export async function upsert(
  trx: TrxOrDb,
  patient_id: number,
  allergies: { id: number }[],
): Promise<void> {
  assertOr400(
    allergies.length === new Set(allergies.map((item) => item.id)).size,
    'Allergy ids must be unique',
  )

  const removing_allergies = trx
    .deleteFrom('patient_allergies')
    .where('patient_id', '=', patient_id)
    .where('created_at', '<', sql<Date>`now()`)
    .execute()

  const adding_allergies = allergies.length && trx
    .insertInto('patient_allergies')
    .values(allergies.map(({ id }) => ({
      patient_id,
      allergy_id: id,
    })))
    .execute()

  await Promise.all([removing_allergies, adding_allergies])
}

export function get(
  trx: TrxOrDb,
  patient_id: number,
): Promise<{ id: number }[]> {
  return trx
    .selectFrom('patient_allergies')
    .where('patient_allergies.patient_id', '=', patient_id)
    .select(['patient_allergies.allergy_id as id'])
    .execute()
}

export function getWithName(
  trx: TrxOrDb,
  patient_id: number,
): Promise<{
  id: number
  name: string
}[]> {
  return trx
    .selectFrom('patient_allergies')
    .innerJoin('allergies', 'allergies.id', 'patient_allergies.allergy_id')
    .where('patient_allergies.patient_id', '=', patient_id)
    .select([
      'allergies.id',
      'allergies.name',
    ])
    .execute()
}
