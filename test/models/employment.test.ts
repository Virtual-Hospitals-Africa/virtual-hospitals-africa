import { afterAll, describe } from 'std/testing/bdd.ts'
import * as employment from '../../db/models/employment.ts'
import db from '../../db/db.ts'
import { insertHealthWorker } from '../_helpers/health_workers.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'

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
            is_admin: false,
            organization_id: '00000000-0000-1000-8000-000000000001',
            health_worker_id: health_worker.id,
          })
        },
      )
    })
  },
)
