import { type SelectQueryBuilder, sql } from 'kysely'
import { DrugSearchResult, Maybe, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import type { DB } from '../../db.d.ts'
import {
  collectSortedUniqNumbers,
  collectSortedUniqStrings,
} from '../../util/collectSorted.ts'
import { base } from './_base.ts'

function baseQuery(trx: TrxOrDb, opts: { include_recalled?: Maybe<boolean> }) {
  return trx.selectFrom('drugs').select((eb_drugs) => [
    'drugs.id',
    'drugs.generic_name as name',
    jsonArrayFrom(
      eb_drugs
        .selectFrom('medications')
        .select((eb_medications) => [
          'medications.id as medication_id',
          'medications.form',
          'medications.form_route',
          'medications.routes',
          'medications.strength_numerator_unit',
          'medications.strength_denominator',
          'medications.strength_denominator_unit',
          'medications.strength_denominator_is_units',
          jsonArrayFrom(
            eb_medications
              .selectFrom('manufactured_medications')
              .leftJoin(
                'manufactured_medication_recalls',
                'manufactured_medication_recalls.manufactured_medication_id',
                'manufactured_medications.id',
              )
              .select([
                'manufactured_medications.id as manufactured_medication_id',
                'manufactured_medications.strength_numerators',
                'manufactured_medications.trade_name',
                'manufactured_medications.applicant_name',
                'manufactured_medication_recalls.recalled_at',
              ])
              .whereRef(
                'manufactured_medications.medication_id',
                '=',
                'medications.id',
              )
              .$if(
                !opts.include_recalled,
                (qb) =>
                  qb.where(
                    'manufactured_medication_recalls.recalled_at',
                    'is',
                    null,
                  ),
              )
              .orderBy([
                'manufactured_medications.trade_name asc',
                'manufactured_medications.strength_numerators asc',
              ]),
          ).as('manufacturers'),
        ])
        .whereRef('medications.drug_id', '=', 'drugs.id')
        .orderBy('medications.form_route', 'asc'),
    ).as('medications'),
  ])
    .$if(!opts.include_recalled, (qb) => {
      const non_recalled_medications = trx.selectFrom(
        'manufactured_medications',
      )
        .select('medication_id')
        .distinct()
        .leftJoin(
          'manufactured_medication_recalls',
          'manufactured_medication_recalls.manufactured_medication_id',
          'manufactured_medications.id',
        )
        .where('recalled_at', 'is', null)

      const non_recalled_drugs = trx.selectFrom('medications')
        .select('drug_id')
        .distinct()
        .where('id', 'in', non_recalled_medications)

      return qb.where('drugs.id', 'in', non_recalled_drugs)
    })
}

type BaseQueryReturn = ReturnType<typeof baseQuery> extends
  SelectQueryBuilder<DB, 'drugs', infer T> ? T : never

function* distinctTradeNames(medications: BaseQueryReturn['medications']) {
  for (const medication of medications) {
    for (const manufacturer of medication.manufacturers) {
      yield manufacturer.trade_name
    }
  }
}

function* strengthNumerators(medication: BaseQueryReturn['medications'][0]) {
  for (const manufacturer of medication.manufacturers) {
    for (const strength_numerator of manufacturer.strength_numerators) {
      yield strength_numerator
    }
  }
}

export function formStrengthDisplay(
  strength_numerators: string,
  strength_numerator_unit: string,
  strength_denominator: string,
  strength_denominator_unit: string,
): string {
  let result = strength_numerators + strength_numerator_unit
  if (
    !['MG', 'G', 'ML', 'L', 'MCG', 'UG', 'IU'].includes(
      strength_denominator_unit,
    )
  ) return result
  result += '/'
  if (parseInt(strength_denominator) !== 1) {
    result += `${strength_denominator}`
  }
  result += strength_denominator_unit
  return result
}

const model = base({
  top_level_table: 'drugs',
  baseQuery,
  formatResult({ medications, ...rest }): DrugSearchResult {
    return {
      all_recalled: medications.every((m) =>
        m.manufacturers.every((m) => m.recalled_at)
      ),
      distinct_trade_names: collectSortedUniqStrings(
        distinctTradeNames(medications),
      ),
      medications: medications.map((m) => {
        const strength_numerators = collectSortedUniqNumbers(
          strengthNumerators(m),
        )
        return {
          ...m,
          strength_numerators,
          // TODO: do the float parsing in SQL?
          strength_denominator: parseFloat(m.strength_denominator),
          strength_summary: formStrengthDisplay(
            strength_numerators.join(', '),
            m.strength_numerator_unit,
            m.strength_denominator,
            m.strength_denominator_unit,
          ),
        }
      }),
      ...rest,
    }
  },
  handleSearch: (
    qb,
    terms: { search: string | null; include_recalled?: Maybe<boolean> },
    trx,
  ) => {
    if (!terms.search) return qb

    const matching_manufactured_medications = trx
      .selectFrom('manufactured_medications')
      .select('medication_id')
      .where('trade_name', 'ilike', `%${terms.search}%`)
      .distinct()

    const matching_drugs = trx
      .selectFrom('medications')
      .select('drug_id')
      .where('id', 'in', matching_manufactured_medications)
      .distinct()

    return qb.where((eb) =>
      eb.or([
        eb('drugs.generic_name', 'ilike', `%${terms.search}%`),
        eb('drugs.id', 'in', matching_drugs),
      ])
    )
      .orderBy(sql`similarity('drugs.name', ${terms.search})`, 'desc')
  },
})

export const getById = model.getById
export const search = model.search
export const getByIds = model.getByIds
