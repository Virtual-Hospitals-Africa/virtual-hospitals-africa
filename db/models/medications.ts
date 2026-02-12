import type { Maybe, RenderedMedication, TrxOrDb } from '../../types.ts'
import { asText, isoDate, jsonArrayFrom, now } from '../helpers.ts'
import { base } from './_base.ts'

// function strengthDisplay(
//   builder: RawBuilder<string>,
// ): RawBuilder<string> {
//   return sql<string>`
//     ${builder} || strength_numerator_unit || (
//       CASE WHEN strength_denominator_unit NOT IN ('MG', 'G', 'ML', 'L', 'MCG', 'UG', 'IU')
//         THEN ''
//         ELSE (
//           '/' || (
//             CASE WHEN strength_denominator = 1
//               THEN ''
//               ELSE strength_denominator::text
//             END
//           ) || strength_denominator_unit
//         )
//       END
//     )
//   `
// }

function baseQuery(trx: TrxOrDb, opts: {
  include_recalled?: boolean
  search?: string | null
  country?: Maybe<string>
}) {
  let qb = trx
    .selectFrom('medications')
    .leftJoin(
      'medication_recalls',
      'medication_recalls.medication_id',
      'medications.id',
    )
    // .innerJoin('drugs', 'drugs.id', 'medications.drug_id')
    .select((eb) => [
      'medications.id',
      'medications.trade_name',
      'medications.applicant_name',
      'medications.form',
      // 'medications.strength_numerators',
      // 'medications.strength_numerator_unit',
      'medications.strength_denominator',
      'medications.strength_denominator_unit',
      'medications.dosage_descriptor_is_units',
      isoDate(eb.ref('medication_recalls.recalled_at'))
        .as('recalled_at'),
      jsonArrayFrom(
        eb.selectFrom('medication_ingredients')
          .innerJoin('drug_ingredients', 'medication_ingredients.drug_ingredient_id', 'drug_ingredients.id')
          .whereRef('medication_ingredients.medication_id', '=', 'medications.id')
          .select((eb_ingredients) => [
            'drug_ingredient_id',
            'name',
            asText(eb_ingredients, 'medication_ingredients.strength_numerator').as('value'),
            'medication_ingredients.strength_numerator_unit as units',
          ]),
      ).as('ingredients'),
    ])
    .$if(
      !opts.include_recalled,
      (eb) => eb.where('medication_recalls.recalled_at', 'is', null),
    )
    .orderBy('medications.trade_name', 'asc')

  if (opts.country) {
    qb = qb.where(
      'medications.id',
      'in',
      trx.selectFrom('medication_availabilities')
        .select('medication_id').where(
          'country',
          '=',
          opts.country,
        ),
    )
  }

  if (!opts.search) return qb

  return qb.where((eb) =>
    eb.or([
      // TODO search by drug ingredient
      // eb('drugs.generic_name', 'ilike', `%${opts.search}%`),
      eb('medications.trade_name', 'ilike', `%${opts.search}%`),
    ])
  )
}

export const medications = base({
  top_level_table: 'medications',
  baseQuery,
  formatResult(result): RenderedMedication {
    return {
      ...result,
      name: result.recalled_at ? `${result.trade_name} (recalled ${result.recalled_at})` : result.trade_name,
      actions: {
        recall: result.recalled_at ? null : `/regulator/medicines/${result.id}/recall`,
      },
    }
  },

  recall(
    trx: TrxOrDb,
    data: {
      medication_id: string
      regulator_id: string
    },
  ) {
    return trx.insertInto('medication_recalls').values({
      medication_id: data.medication_id,
      recalled_at: now,
      recalled_by: data.regulator_id,
    })
      .returning('id')
      .executeTakeFirstOrThrow()
  },

  unrecall(trx: TrxOrDb, data: { id: string }) {
    return trx.deleteFrom('medication_recalls')
      .where('id', '=', data.id)
      .execute()
  },
  // strengthDisplay,
})
