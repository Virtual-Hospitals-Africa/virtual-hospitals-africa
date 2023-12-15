import { assert } from 'std/assert/assert.ts'
import { DrugSearchResult, Maybe, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'

export function search(
  trx: TrxOrDb,
  opts: {
    search?: Maybe<string>
    ids?: Maybe<number[]>
  },
): Promise<DrugSearchResult[]> {
  if (opts.ids) assert(opts.ids.length, 'must provide at least one id')
  let query = trx
    .selectFrom('drugs')
    .select((eb_drugs) => [
      'drugs.id as drug_id',
      'drugs.generic_name as drug_generic_name',
      jsonArrayFrom(
        eb_drugs.selectFrom('medications')
          .select((eb_medications) => [
            'medications.id as medication_id',
            'medications.form',
            'medications.strength_numerators',
            'medications.strength_numerator_unit',
            'medications.strength_denominator',
            'medications.strength_denominator_unit',
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

  if (opts.search) {
    query = query.where('generic_name', 'ilike', `%${opts.search}%`)
  }
  if (opts.ids) query = query.where('drugs.id', 'in', opts.ids)

  return query.execute()
}
