import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'

export function search(
  trx: TrxOrDb,
  search: string,
) {
  return trx
    .selectFrom('icd10_tabular')
    .select([
      'code',
      'description',
      sql<number>`similarity(description, ${search})`.as('rank'),
    ])
    .where(sql<boolean>`description % ${search}`)
    .orderBy('rank', 'desc')
    .execute()
}
