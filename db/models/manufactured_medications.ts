import { RawBuilder, sql } from 'kysely'
import {
  type Maybe,
  RenderedManufacturedMedication,
  TrxOrDb,
} from '../../types.ts'
import { isoDate, now } from '../helpers.ts'
import { base } from './_base.ts'

export function strengthDisplay(
  builder: RawBuilder<string>,
): RawBuilder<string> {
  return sql<string>`
    ${builder} || strength_numerator_unit || (
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

export default base({
  top_level_table: 'manufactured_medications',
  baseQuery: (
    trx: TrxOrDb,
    opts: { include_recalled?: Maybe<boolean>; search: string | null },
  ) =>
    trx
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
        isoDate(eb.ref('manufactured_medication_recalls.recalled_at'))
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
      ]),
  formatResult(result): RenderedManufacturedMedication {
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
  },
  handleSearch(
    qb,
    opts: { search: string | null; include_recalled?: Maybe<boolean> },
  ) {
    if (!opts.search) return qb

    return qb.where((eb) =>
      eb.or([
        eb('drugs.generic_name', 'ilike', `%${opts.search}%`),
        eb('manufactured_medications.trade_name', 'ilike', `%${opts.search}%`),
      ])
    )
  },

  recall(
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
  },

  unrecall(trx: TrxOrDb, data: { id: string }) {
    return trx.deleteFrom('manufactured_medication_recalls')
      .where('id', '=', data.id)
      .execute()
  },
})
