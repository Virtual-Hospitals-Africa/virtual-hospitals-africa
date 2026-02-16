import { TrxOrDb } from '../../../types.ts'
import parseJSON from '../../../util/parseJSON.ts'
import { define } from '../define.ts'

export default define([
  'regulatory_agencies',
], (trx: TrxOrDb) =>
  trx.insertInto('regulatory_agencies')
    .values([
      { country: 'ZA', name: '' },
    ]))
