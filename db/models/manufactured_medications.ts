import { RawBuilder, type SelectQueryBuilder, sql } from 'kysely'
import {
  type Maybe,
  RenderedManufacturedMedication,
  TrxOrDb,
} from '../../types.ts'
import { now, nullableDateString } from '../helpers.ts'
import type { DB } from '../../db.d.ts'
import { assert } from 'std/assert/assert.ts'

export function strengthDisplay(
  builder: RawBuilder<string>,
): RawBuilder<string> {
  return sql<string>`
  ${builder} ||
  strength_numerator_unit || (
    CASE WHEN strength_denominator_unit NOT IN ('MG', 'G', 'ML', 'L', 'MCG', 'UG', 'IU')
      THEN ''
      ELSE (
        '/' || (
          CASE WHEN strength_denominator = 1 
            THEN ''
            ELSE strength_denominator::text
          END
        ) || strength_denominator_unit
      )
    END
  )
`
}

function strengthSummary(base_table: string) {
  return strengthDisplay(
    sql<string>`array_to_string(${
      sql.ref(base_table)
    }.strength_numerators, ', ')`,
  ).as('strength_summary')
}

function baseQuery(trx: TrxOrDb, opts: { include_recalled?: Maybe<boolean> }) {
  return trx
    .selectFrom('manufactured_medications')
    .innerJoin(
      'medications',
      'medications.id',
      'manufactured_medications.medication_id',
    )
    .innerJoin('drugs', 'drugs.id', 'medications.drug_id')
    .leftJoin(
      'manufactured_medication_recalls',
      'manufactured_medication_recalls.manufactured_medication_id',
      'manufactured_medications.id',
    )
    .select((eb) => [
      'manufactured_medications.id',
      'drugs.generic_name',
      'manufactured_medications.trade_name',
      'manufactured_medications.applicant_name',
      'medications.form',
      'medications.strength_numerators',
      'medications.strength_numerator_unit',
      'medications.strength_denominator',
      'medications.strength_denominator_unit',
      'medications.strength_denominator_is_units',
      strengthSummary('manufactured_medications'),
      nullableDateString(eb.ref('manufactured_medication_recalls.recalled_at'))
        .as('recalled_at'),
    ])
    .$if(
      !opts.include_recalled,
      (eb) =>
        eb.where('manufactured_medication_recalls.recalled_at', 'is', null),
    )
    .orderBy([
      'drugs.generic_name asc',
      'manufactured_medications.trade_name asc',
    ])
}

type BaseQueryReturn = ReturnType<typeof baseQuery> extends // deno-lint-ignore no-explicit-any
SelectQueryBuilder<DB, any, infer T> ? T
  : never

function formatResult(result: BaseQueryReturn): RenderedManufacturedMedication {
  return {
    ...result,
    strength_denominator: parseFloat(result.strength_denominator),
    name: result.recalled_at
      ? `${result.generic_name} (recalled ${result.recalled_at})`
      : result.generic_name,
    actions: {
      recall: result.recalled_at
        ? null
        : `/regulator/medicines/${result.id}/recall`,
    },
  }
}

function formatResults(
  results: BaseQueryReturn[],
): RenderedManufacturedMedication[] {
  return results.map(formatResult)
}

export async function search(
  trx: TrxOrDb,
  opts: {
    search: string | null
    page?: Maybe<number>
    rows_per_page?: Maybe<number>
  },
): Promise<{
  page: number
  rows_per_page: number
  results: RenderedManufacturedMedication[]
  has_next_page: boolean
  search: string | null
}> {
  const page = opts.page ?? 1
  const rows_per_page = opts.rows_per_page ?? 10
  const offset = (page - 1) * rows_per_page

  let query = baseQuery(trx, { include_recalled: !!opts.search })
    .limit(rows_per_page + 1)
    .offset(offset)

  if (opts.search) {
    query = query.where((eb) =>
      eb.or([
        eb('drugs.generic_name', 'ilike', `%${opts.search}%`),
        eb('manufactured_medications.trade_name', 'ilike', `%${opts.search}%`),
      ])
    )
  }

  const medicines = await query.execute()
  const results = medicines.slice(0, rows_per_page).map(formatResult)
  const has_next_page = medicines.length > rows_per_page

  return { page, rows_per_page, results, has_next_page, search: opts.search }
}

export function getById(trx: TrxOrDb, manufactured_medication_id: string) {
  return baseQuery(trx, { include_recalled: true })
    .where('manufactured_medications.id', '=', manufactured_medication_id)
    .executeTakeFirstOrThrow()
    .then(formatResult)
}

export function getByIds(trx: TrxOrDb, manufactured_medication_ids: string[]) {
  assert(manufactured_medication_ids.length > 0)
  return baseQuery(trx, { include_recalled: true })
    .where('manufactured_medications.id', 'in', manufactured_medication_ids)
    .execute()
    .then(formatResults)
}

export function recall(
  trx: TrxOrDb,
  data: {
    manufactured_medication_id: string
    regulator_id: string
  },
) {
  return trx.insertInto('manufactured_medication_recalls').values({
    manufactured_medication_id: data.manufactured_medication_id,
    recalled_at: now,
    recalled_by: data.regulator_id,
  })
    .returning('id')
    .executeTakeFirstOrThrow()
}

export function unrecall(trx: TrxOrDb, data: { id: string }) {
  return trx.deleteFrom('manufactured_medication_recalls')
    .where('id', '=', data.id)
    .execute()
}
