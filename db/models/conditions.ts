import { Condition, Maybe, TrxOrDb } from '../../types.ts'

export function search(
  trx: TrxOrDb,
  opts: {
    search?: Maybe<string>
  },
): Promise<Condition[]> {
  return trx
    .selectFrom('conditions')
    .select([
      'conditions.id',
      'conditions.name',
      'conditions.term_icd9_code',
      'conditions.term_icd9_text',
      'conditions.consumer_name',
      'conditions.is_procedure',
      'conditions.info_link_href',
      'conditions.info_link_text',
    ])
    .where('name', 'ilike', `%${opts.search}%`)
    .execute()
}
