import { RenderedRegulatorPharmacist, TrxOrDb } from '../../types.ts'
import { concat, jsonBuildObject } from '../helpers.ts'
import { base, identity } from './_base.ts'
import { pharmacists, PharmacistSearch } from './pharmacists.ts'

export const regulator_pharmacists = base({
  top_level_table: 'pharmacists',
  baseQuery(trx: TrxOrDb, opts: PharmacistSearch) {
    return pharmacists.baseQuery(trx, opts)
      .select((eb) => [
        jsonBuildObject({
          view: concat('/regulator/pharmacists/', eb.ref('pharmacists.id')),
          revoke: concat('/regulator/pharmacists/', eb.ref('pharmacists.id'), '/revoke'),
          edit: concat('/regulator/pharmacists/', eb.ref('pharmacists.id'), '/edit'),
        }).as('actions'),
      ])
  },
  formatResult: identity<RenderedRegulatorPharmacist>,
})
