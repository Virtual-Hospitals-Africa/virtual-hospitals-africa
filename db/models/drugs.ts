import { type SelectQueryBuilder, sql } from 'kysely'
import { DrugSearchResult, TrxOrDb } from '../../types.ts'
import { asText, asTextArray, jsonArrayFrom } from '../helpers.ts'
import type { DB } from '../../db.d.ts'
import { collectSortedUniqDecimals, collectSortedUniqStrings } from '../../util/collectSorted.ts'
import { base } from './_base.ts'
import { positive_decimal } from '../../util/validators.ts'

// TODO: revisit this in light of _country_ recalling certain drugs
function baseQuery(opts: { include_recalled: boolean }) {
  return function (trx: TrxOrDb) {
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
            asText(eb_medications, 'medications.strength_denominator').as(
              'strength_denominator',
            ),
            'medications.strength_denominator_unit',
            'medications.dosage_descriptor_is_units',
            jsonArrayFrom(
              eb_medications
                .selectFrom('medications')
                .leftJoin(
                  'medication_recalls',
                  'medication_recalls.medication_id',
                  'medications.id',
                )
                .select((eb_mm) => [
                  'medications.id as medication_id',
                  'medications.trade_name',
                  'medications.applicant_name',
                  'medication_recalls.recalled_at',
                  asTextArray(
                    eb_mm,
                    'medications.strength_numerators',
                  ).as('strength_numerators'),
                ])
                .whereRef(
                  'medications.medication_id',
                  '=',
                  'medications.id',
                )
                .$if(
                  !opts.include_recalled,
                  (qb) =>
                    qb.where(
                      'medication_recalls.recalled_at',
                      'is',
                      null,
                    ),
                )
                .orderBy('medications.trade_name', 'asc')
                .orderBy('medications.strength_numerators', 'asc'),
            ).as('manufacturers'),
          ])
          .whereRef('medications.drug_id', '=', 'drugs.id')
          .orderBy('medications.form_route', 'asc'),
      ).as('medications'),
    ])
      .$if(!opts.include_recalled, (qb) => {
        const non_recalled_medications = trx.selectFrom(
          'medications',
        )
          .select('medication_id')
          .distinct()
          .leftJoin(
            'medication_recalls',
            'medication_recalls.medication_id',
            'medications.id',
          )
          .where('recalled_at', 'is', null)

        const non_recalled_drugs = trx.selectFrom('medications')
          .select('drug_id')
          .distinct()
          .where('id', 'in', non_recalled_medications)

        return qb.where('drugs.id', 'in', non_recalled_drugs)
      })
  }
}

type BaseQueryReturn = ReturnType<ReturnType<typeof baseQuery>> extends SelectQueryBuilder<DB, 'drugs', infer T> ? T : never

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
      yield positive_decimal.parse(strength_numerator)
    }
  }
}

function formStrengthDisplay(
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

export const drugs = base({
  top_level_table: 'drugs',
  baseQuery: baseQuery({ include_recalled: false }),
  formatResult({ medications, ...rest }): DrugSearchResult {
    console.log({ medications, ...rest })
    return {
      all_recalled: medications.every((m) => m.manufacturers.every((m) => m.recalled_at)),
      distinct_trade_names: collectSortedUniqStrings(
        distinctTradeNames(medications),
      ),
      medications: medications.map((m) => {
        const strength_numerators = collectSortedUniqDecimals(
          strengthNumerators(m),
        ).map((d) => d.toFixed())
        return {
          ...m,
          strength_numerators,
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
    terms: { search: string | null },
    trx,
  ) => {
    if (!terms.search) return qb

    const matching_medications = trx
      .selectFrom('medications')
      .select('medication_id')
      .where('trade_name', 'ilike', `%${terms.search}%`)
      .distinct()

    const matching_drugs = trx
      .selectFrom('medications')
      .select('drug_id')
      .where('id', 'in', matching_medications)
      .distinct()

    return qb.where((eb) =>
      eb.or([
        eb('drugs.generic_name', 'ilike', `%${terms.search}%`),
        eb('drugs.id', 'in', matching_drugs),
      ])
    )
      .orderBy(sql`similarity('drugs.name', ${terms.search})`, 'desc')
  },
  formStrengthDisplay,
})
