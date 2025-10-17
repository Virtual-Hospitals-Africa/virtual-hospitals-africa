import { TrxOrDb } from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { isoDate } from '../helpers.ts'


export type PatientInsurance = {
  id: string
  insurance_provider: string
  plan_name: string | null
  membership_number: string
  valid_from: string
  expire_date: string
  is_dependent: boolean
}

export function getById(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
) {
  return trx
    .selectFrom('patient_insurance')
    .select((eb) => [
      'id',
      'insurance_provider',
      'plan_name',
      'membership_number',
      isoDate(eb.ref('valid_from')).as('valid_from'),
      isoDate(eb.ref('expire_date')).as('expire_date'),
      'is_dependent',
    ])
    .where('patient_insurance.patient_id', '=', patient_id)
    .executeTakeFirst()
}

export function getCurrentInsurance(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
) {
  const now = new Date()
  return trx
    .selectFrom('patient_insurance')
    .select((eb) => [
      'id',
      'insurance_provider',
      'plan_name',
      'membership_number',
      isoDate(eb.ref('valid_from')).as('valid_from'),
      isoDate(eb.ref('expire_date')).as('expire_date'),
      'is_dependent',
    ])
    .where('patient_insurance.patient_id', '=', patient_id)
    .where('valid_from', '<=', now)
    .where('expire_date', '>=', now)
    .executeTakeFirst()
}

export function setCurrentInsurance(
  trx: TrxOrDb,
  {
    patient_id,
    insurance_provider,
    plan_name,
    membership_number,
    valid_from,
    expire_date,
    is_dependent,
  }: {
    patient_id: string
    insurance_provider: string
    plan_name?: string
    membership_number: string
    valid_from: string
    expire_date: string
    is_dependent: boolean
  },
) {
  const validFromDate = valid_from ? new Date(valid_from) : null
  const expireDateDate = expire_date ? new Date(expire_date) : null
  const now = new Date()

  if (validFromDate) {
    assertOr400(
      validFromDate <= now,
      'Insurance valid_from date must be in the past or today',
    )
  }

  if (expireDateDate) {
    assertOr400(
      expireDateDate >= now,
      'Insurance expire_date must be in the future or today',
    )
  }

  if (validFromDate && expireDateDate) {
    assertOr400(
      validFromDate < expireDateDate,
      'Insurance valid_from must be before expire_date',
    )
  }

  return trx
    .insertInto('patient_insurance')
    .values({
      patient_id,
      insurance_provider,
      plan_name,
      membership_number,
      valid_from,
      expire_date,
      is_dependent,
    })
    .executeTakeFirstOrThrow()
}
