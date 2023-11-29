import { Maybe, Medication, TrxOrDb } from '../../types.ts'

export async function search(
  trx: TrxOrDb,
  opts: {
    search?: Maybe<string>
  }
): Promise<Medication[]> {
  const query = trx
    .selectFrom('medications')
    .select([
      'medications.key_id',
      'medications.trade_name',
      'medications.generic_name',
      'medications.forms',
      'medications.strength',
      'medications.category',
      'medications.registration_no',
      'medications.applicant_name',
      'medications.manufacturers',
    ])
    .where('generic_name', 'ilike', `%${opts.search}%`)
  const medications = await query.execute()
  return medications
}
