import { Condition, Maybe, TrxOrDb } from '../../types.ts'

function baseQuery(trx: TrxOrDb) {
  return trx
    .selectFrom('conditions')
    .where('is_procedure', '=', false)
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

function formatResults(conditions: Condition[]): Condition[] {
  return conditions
}

export async function search(
  trx: TrxOrDb,
  opts: {
    search: string | null
    is_procedure: boolean
    page?: Maybe<number>
    rows_per_page?: Maybe<number>
  },
) {
  const page = opts.page ?? 1
  const rows_per_page = opts.rows_per_page ?? 10
  const offset = (page - 1) * rows_per_page

  let query = baseQuery(trx)
    .where('is_procedure', '=', opts.is_procedure)
    .limit(rows_per_page + 1)
    .offset(offset)

  if (opts.search) {
    query = query.where('name', 'ilike', `%${opts.search}%`)
  }

  const drugs = await query.execute()
  const results = formatResults(drugs.slice(0, rows_per_page))
  const has_next_page = drugs.length > rows_per_page

  return { page, rows_per_page, results, has_next_page, search: opts.search }
}
