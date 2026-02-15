import type { RenderedMedicationAvailbility, TrxOrDb } from '../../types.ts'
import { concat, isoDate, jsonBuildObject, now } from '../helpers.ts'
import { base, identity } from './_base.ts'
import { medications } from './medications.ts'

export type MedicationAvailabilityOpts = {
  country?: string
  search?: string | null
  include_recalled?: boolean
}

export const medication_availabilities = base({
  top_level_table: 'medications',
  baseQuery(trx: TrxOrDb, opts: MedicationAvailabilityOpts) {
    return medications.baseQuery(trx, { search: opts.search })
      .innerJoin(
        'medication_availabilities',
        'medication_availabilities.medication_id',
        'medications.id',
      )
      .leftJoin(
        'medication_recalls',
        'medication_recalls.medication_availability_id',
        'medications.id',
      )
      .select((eb) => [
        'country',
        'registration_number',
        isoDate(eb.ref('medication_recalls.recalled_at')).as('recalled_at'),
        jsonBuildObject({
          recall: eb.case()
            .when('recalled_at', 'is', null)
            .then(concat('/regulator/medications/', eb.ref('medications.id'), '/recall'))
            .end(),
        }).as('actions'),
      ])
      .$if(
        !opts.include_recalled,
        (eb) => eb.where('medication_recalls.recalled_at', 'is', null),
      )
      .$if(
        !!opts.country,
        (eb) => eb.where('medication_availabilities.country', '=', opts.country!),
      )
  },

  formatResult: identity<RenderedMedicationAvailbility>,

  recall(
    trx: TrxOrDb,
    data: {
      medication_availability_id: string
      regulator_id: string
    },
  ) {
    return trx.insertInto('medication_recalls').values({
      recalled_by: data.regulator_id,
      medication_availability_id: data.medication_availability_id,
      recalled_at: now,
    })
      .returning('id')
      .executeTakeFirstOrThrow()
  },

  unrecall(trx: TrxOrDb, data: { id: string }) {
    return trx.deleteFrom('medication_recalls')
      .where('id', '=', data.id)
      .execute()
  },
})
