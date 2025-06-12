import type { SelectQueryBuilder } from 'kysely'
import { Condition, TrxOrDb } from '../../types.ts'
import { base } from './_base.ts'
import type { DB } from '../../db.d.ts'

function baseQuery(
  trx: TrxOrDb,
): SelectQueryBuilder<DB, 'conditions', Condition> {
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
}

const model = base({
  top_level_table: 'conditions',
  baseQuery,
  formatResult: (x: Condition): Condition => x,
  handleSearch(
    qb,
    opts: { search: string | null; is_procedure: boolean },
  ) {
    if (opts.search) {
      qb = qb.where('name', 'ilike', `%${opts.search}%`)
    }

    return qb.where('is_procedure', '=', opts.is_procedure)
  },
})

export const search = model.search
export const getById = model.getById
export const getByIds = model.getByIds
