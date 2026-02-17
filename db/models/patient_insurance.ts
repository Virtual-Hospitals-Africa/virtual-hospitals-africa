import { Maybe, RenderedPatientInsurance, TrxOrDbOrQueryCreator } from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { todayISOInJohannesburg } from '../../util/date.ts'
import { isoDate, today_in_johannesburg } from '../helpers.ts'

function baseQuery(
  trx: TrxOrDbOrQueryCreator,
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
}

export const patient_insurance = {
  getById(
    trx: TrxOrDbOrQueryCreator,
    { patient_id }: { patient_id: string },
  ): Promise<RenderedPatientInsurance[]> {
    return baseQuery(trx)
      .where('patient_insurance.patient_id', '=', patient_id)
      .orderBy('expire_date', 'desc')
      .execute()
  },
  getCurrent(
    trx: TrxOrDbOrQueryCreator,
    { patient_id }: { patient_id: string },
  ): Promise<RenderedPatientInsurance | undefined> {
    return baseQuery(trx)
      .where('patient_insurance.patient_id', '=', patient_id)
      .where('valid_from', '<=', today_in_johannesburg)
      .where('expire_date', '>=', today_in_johannesburg)
      .executeTakeFirst()
  },
  async setCurrent(
    trx: TrxOrDbOrQueryCreator,
    insert: {
      patient_id: string
      insurance_provider: string
      plan_name?: Maybe<string>
      membership_number: string
      valid_from: string
      expire_date: string
      is_dependent: boolean
    },
  ) {
    const today = todayISOInJohannesburg()

    assertOr400(
      insert.valid_from <= today,
      'Insurance valid_from date must be in the past or today',
    )

    assertOr400(
      insert.expire_date >= today,
      'Insurance expire_date must be in the future or today',
    )

    const current_insurance = await patient_insurance.getCurrent(trx, {
      patient_id: insert.patient_id,
    })

    if (current_insurance) {
      return trx.updateTable('patient_insurance')
        .set(insert)
        .where('id', '=', current_insurance.id)
        .execute()
    }

    return trx
      .insertInto('patient_insurance')
      .values(insert)
      .executeTakeFirstOrThrow()
  },
  clearCurrent(
    trx: TrxOrDbOrQueryCreator,
    { patient_id }: {
      patient_id: string
    },
  ) {
    return trx.deleteFrom('patient_insurance')
      .where('patient_id', '=', patient_id)
      .where('valid_from', '<=', today_in_johannesburg)
      .where('expire_date', '>=', today_in_johannesburg)
      .execute()
  },
}
