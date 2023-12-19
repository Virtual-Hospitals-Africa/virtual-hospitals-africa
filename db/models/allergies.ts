import { Allergy, Maybe, TrxOrDb } from '../../types.ts'

export function search(
  trx: TrxOrDb,
  opts: {
    search?: Maybe<string>
    ids?: Maybe<number[]>
    without_ids?: Maybe<number[]>
  },
): Promise<Allergy[]> {
  let query = trx
    .selectFrom('allergies')
    .select([
      'id',
      'name',
    ])

  if (opts.search) {
    query = query.where('name', 'ilike', `%${opts.search}%`)
  }
  if (opts.ids) {
    query = query.where('id', 'in', opts.ids)
  }
  if (opts.without_ids) {
    query = query.where('id', 'not in', opts.without_ids)
  }

  return query.execute()
}
