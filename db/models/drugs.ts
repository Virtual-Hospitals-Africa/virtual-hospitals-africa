import { RawBuilder, sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import {
  DrugSearchResult,
  ManufacturedMedicationSearchResult,
  Maybe,
  RenderedMedicine,
  TrxOrDb,
} from '../../types.ts'
import { jsonArrayFrom, jsonArrayFromColumn } from '../helpers.ts'

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

export function strengthSummary(base_table: string) {
  return strengthDisplay(
    sql<string>`array_to_string(${
      sql.ref(base_table)
    }.strength_numerators, ', ')`,
  ).as('strength_summary')
}

function baseQuery(trx: TrxOrDb) {
  return trx
    .selectFrom('drugs')
    .select((eb_drugs) => [
      'drugs.id',
      'drugs.generic_name as name',
      jsonArrayFromColumn(
        'trade_name',
        eb_drugs
          .selectFrom('medications')
          .innerJoin(
            'manufactured_medications',
            'manufactured_medications.medication_id',
            'medications.id',
          )
          .whereRef(
            'medications.drug_id',
            '=',
            'drugs.id',
          )
          .where(
            'manufactured_medications.trade_name',
            '!=',
            eb_drugs.ref('drugs.generic_name'),
          )
          .select('manufactured_medications.trade_name')
          .distinct(),
      ).as('distinct_trade_names'),
      jsonArrayFrom(
        eb_drugs.selectFrom('medications')
          .select((eb_medications) => [
            'medications.id as medication_id',
            'medications.form',
            'medications.form_route',
            'medications.routes',
            'medications.strength_numerators',
            'medications.strength_numerator_unit',
            'medications.strength_denominator',
            'medications.strength_denominator_unit',
            'medications.strength_denominator_is_units',
            strengthSummary('medications'),
            jsonArrayFrom(
              eb_medications.selectFrom('manufactured_medications')
                .select([
                  'manufactured_medications.id as manufactured_medication_id',
                  'manufactured_medications.strength_numerators',
                  'manufactured_medications.trade_name',
                  'manufactured_medications.applicant_name',
                ])
                .whereRef(
                  'manufactured_medications.medication_id',
                  '=',
                  'medications.id',
                ),
            ).as('manufacturers'),
          ])
          .whereRef(
            'medications.drug_id',
            '=',
            'drugs.id',
          ),
      ).as('medications'),
    ])
}

export async function search(
  trx: TrxOrDb,
  opts: {
    search?: Maybe<string>
    ids?: Maybe<string[]>
  },
): Promise<DrugSearchResult[]> {
  if (opts.ids) {
    assert(opts.ids.length, 'must provide at least one id')
    assert(!opts.search)
  } else {
    assert(opts.search)
  }

  const query = opts.search
    ? trx
      .selectFrom(baseQuery(trx).as('drug_search_results'))
      .selectAll()
      .where((eb) =>
        eb.or([
          eb('drug_search_results.name', 'ilike', `%${opts.search}%`),
          sql<
            boolean
          >`EXISTS (select 1 from json_array_elements_text("drug_search_results"."distinct_trade_names") AS trade_name
            WHERE trade_name ILIKE ${'%' + opts.search + '%'})`,
        ])
      )
      .orderBy(sql`similarity(name, ${opts.search})`, 'desc')
    : baseQuery(trx).where('drugs.id', 'in', opts.ids!)

  const results = await query.limit(20).execute()

  // TODO: do the float parsing in SQL?
  return results.map((r) => ({
    ...r,
    medications: r.medications.map((m) => ({
      ...m,
      strength_denominator: parseFloat(m.strength_denominator),
    })),
  }))
}

export async function searchManufacturedMedications(
  trx: TrxOrDb,
  opts: {
    search?: Maybe<string>
    ids?: Maybe<string[]>
  },
): Promise<ManufacturedMedicationSearchResult[]> {
  if (opts.ids) {
    assert(opts.ids.length, 'must provide at least one id')
    assert(!opts.search)
  } else {
    assert(opts.search)
  }

  let query = trx
    .selectFrom('manufactured_medications')
    .innerJoin(
      'medications',
      'medications.id',
      'manufactured_medications.medication_id',
    )
    .innerJoin('drugs', 'drugs.id', 'medications.drug_id')
    .select([
      'manufactured_medications.id',
      sql<
        string
      >`manufactured_medications.trade_name || ' ' || medications.form || ' by ' || manufactured_medications.applicant_name`
        .as('name'),
      'drugs.generic_name',
      'manufactured_medications.trade_name',
      'manufactured_medications.applicant_name',
      'medications.form',
      'medications.strength_numerator_unit',
      'medications.strength_denominator',
      'medications.strength_denominator_unit',
      'medications.strength_denominator_is_units',
      'manufactured_medications.strength_numerators',
      strengthSummary('manufactured_medications'),
    ])
    .limit(20)

  if (opts.search) {
    //if multiple words are given, like lamivudine solution, it will check for both form and name
    const searchWords = opts.search.split(' ').filter(Boolean)
    query = query.where((eb) =>
      eb.and(
        searchWords.map((word) =>
          eb.or([
            eb('manufactured_medications.trade_name', 'ilike', `%${word}%`),
            eb('drugs.generic_name', 'ilike', `%${word}%`),
            eb('medications.form', 'ilike', `%${word}%`),
          ])
        ),
      )
    )
  } else {
    query = query.where('manufactured_medications.id', 'in', opts.ids!)
  }

  const results = await query.execute()
  return results.map((r) => ({
    ...r,
    strength_denominator: parseFloat(r.strength_denominator),
  }))
}

export async function get(
  trx: TrxOrDb,
  page: number = 1,
  rowsPerPage: number = 10,
): Promise<{ medicines: RenderedMedicine[]; totalRows: number }> {
  const offset = (page - 1) * rowsPerPage
  const medicines = await trx
    .selectFrom('manufactured_medications')
    .innerJoin(
      'medications',
      'medications.id',
      'manufactured_medications.medication_id',
    )
    .innerJoin('drugs', 'drugs.id', 'medications.drug_id')
    .select([
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
    ])
    .orderBy('drugs.generic_name', 'asc')
    .limit(rowsPerPage)
    .offset(offset)
    .execute()

  const totalRowsResult = await trx
    .selectFrom('manufactured_medications')
    .select((eb) => eb.fn.count('id').as('totalRows'))
    .execute()

  const totalRows = parseInt(totalRowsResult[0].totalRows.toString(), 10)

  return {
    medicines: medicines.map((medicine) => ({
      ...medicine,
      strength_denominator: parseFloat(medicine.strength_denominator),
      actions: {
        recall: `/regulator/medicines/${medicine.id}/recall`,
      },
    })),
    totalRows,
  }
}
