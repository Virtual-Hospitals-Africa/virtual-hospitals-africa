import { assert } from 'std/assert/assert.ts'
import { Maybe, RenderedPatientAge, TrxOrDb } from '../../types.ts'

export async function get(
  trx: TrxOrDb,
  opts: { patient_id: string },
): Promise<Maybe<RenderedPatientAge>> {
  const result = await trx
    .selectFrom('patient_age')
    .selectAll()
    .where('patient_age.patient_id', '=', opts.patient_id)
    .executeTakeFirst()

  if (!result) return null
  assert(result.age != null)
  assert(result.age_display != null)
  assert(result.age_number != null)
  assert(result.age_unit != null)
  assert(result.age_years != null)
  assert(result.patient_id != null)

  return {
    age: result.age,
    age_display: result.age_display,
    age_number: result.age_number,
    age_unit: result.age_unit,
    age_years: parseInt(result.age_years, 10),
  }
}

export async function getYears(
  trx: TrxOrDb,
  opts: { patient_id: string },
): Promise<Maybe<number>> {
  const patient_age = await get(trx, opts)
  return patient_age?.age_years
}
