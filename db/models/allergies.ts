import { Allergy, Maybe, TrxOrDb } from '../../types.ts'

export function search(
  trx: TrxOrDb,
  opts: {
    search?: Maybe<string>
    ids?: Maybe<number[]>
  },
): Promise<Allergy[]> {
  let query = trx
    .selectFrom('allergies')
    .select([
      'id',
      'name'
    ])

  if (opts.search) {
    query = query.where('name', 'ilike', `%${opts.search}%`)
  }

  return query.execute()
}
