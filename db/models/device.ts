import { Maybe, TrxOrDb } from '../../types.ts'

export function search(
    trx: TrxOrDb,
    search?: Maybe<string>,
  ) {
    let query = trx
      .selectFrom('devices')
      .selectAll()
  
    if (search) query = query.where('name', 'ilike', `%${search}%`)
  
    return query.execute()
  }