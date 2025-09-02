import { afterAll, describe } from 'std/testing/bdd.ts'
import * as employment from '../../db/models/employment.ts'
import { insertHealthWorker, itUsesTrxAnd } from '../web/utilities.ts'
import db from '../../db/db.ts'

describe(
  'db/models/employment.ts',
  () => {
    afterAll(() => db.destroy())
    describe('addOne', () => {
      itUsesTrxAnd(
        'can add a nurse',
        async (trx) => {
          const health_worker = await insertHealthWorker(trx)
          await employment.addOne(trx, {
            profession: 'nurse',
            organization_id: '00000000-0000-0000-0000-000000000001',
            health_worker_id: health_worker.id,
          })
        },
      )
    })
  },
)
