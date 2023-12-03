import { Maybe, Condition, TrxOrDb } from '../../types.ts'

export async function search(
  trx: TrxOrDb,
  opts: {
    search?: Maybe<string>
  },
): Promise<Condition[]> {
  const query = trx
    .selectFrom('conditions')
    .select([
      'conditions.key_id',
      'conditions.primary_name',
      'conditions.term_icd9_code',
      'conditions.term_icd9_text',
      'conditions.consumer_name',
      'conditions.is_procedure',
      'conditions.info_link_href',
      'conditions.info_link_text',
    ])
    .where('primary_name', 'ilike', `%${opts.search}%`)
  const conditions = await query.execute()
  return conditions
}