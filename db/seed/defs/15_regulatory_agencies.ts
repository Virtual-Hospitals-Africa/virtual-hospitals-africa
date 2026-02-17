import { REGULATORY_AGENCIES } from '../../../shared/regulatory_agencies.ts'
import { TrxOrDb } from '../../../types.ts'
import entries from '../../../util/entries.ts'
import { define } from '../define.ts'

const to_insert = entries(REGULATORY_AGENCIES)
  .flatMap(([country, agencies]) => agencies.map(({ name, acronym }) => ({ country, name, acronym })))

export default define([
  'regulatory_agencies',
], (trx: TrxOrDb) =>
  trx.insertInto('regulatory_agencies')
    .values(to_insert).execute())
