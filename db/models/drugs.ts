import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { DrugSearchResult, Maybe, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom, jsonArrayFromColumn } from '../helpers.ts'

export function search(
  trx: TrxOrDb,
  opts: {
    search?: Maybe<string>
    ids?: Maybe<number[]>
  },
): Promise<DrugSearchResult[]> {
  if (opts?.ids) assert(opts.ids.length, 'must provide at least one id')
  let drugsQuery = trx
    .selectFrom('drugs')
    .select((eb_drugs) => [
      'drugs.id as drug_id',
      'drugs.generic_name as drug_generic_name',
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
            sql<string>`
              array_to_string(strength_numerators, ', ') ||
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
            `.as('strength_summary'),
            jsonArrayFrom(
              eb_medications.selectFrom('manufactured_medications')
                .select([
                  'manufactured_medications.id as manufactured_medication_id',
                  'manufactured_medications.strength_numerators',
                  'manufactured_medications.trade_name',
                  'manufactured_medications.manufacturer_name',
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

  if (opts?.ids) drugsQuery = drugsQuery.where('drugs.id', 'in', opts.ids)

  const searchQuery = trx.selectFrom(drugsQuery.as('drugs')).selectAll().where((
    eb,
  ) =>
    eb.or([
      eb('drugs.drug_generic_name', 'ilike', `%${opts.search}%`),
      sql`EXISTS (select 1 from json_array_elements_text("drugs"."distinct_trade_names") AS trade_name
        WHERE trade_name ILIKE ${'%' + opts?.search + '%'})`,
    ])
  )

  const query = (opts?.search ? searchQuery : drugsQuery).limit(20)
  return query.execute()
}
