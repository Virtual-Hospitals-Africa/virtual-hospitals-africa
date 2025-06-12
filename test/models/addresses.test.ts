import { afterAll, describe } from 'std/testing/bdd.ts'
import * as addresses from '../../db/models/addresses.ts'
import { createTestAddress } from '../mocks.ts'
import omit from '../../util/omit.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'
import db from '../../db/db.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'

describe('db/models/address.ts', () => {
  afterAll(() => db.destroy())

  describe('upsert', () => {
    itUsesTrxAnd(
      'inserts addresses, making a new id each time',
      async (trx) => {
        const randomAddress = await createTestAddress()

        const address1 = await addresses.insert(trx, randomAddress)
        const address2 = await addresses.insert(trx, randomAddress)

        assertNotEquals(
          omit(address1, ['created_at', 'updated_at']),
          omit(address2, ['created_at', 'updated_at']),
        )
      },
    )
  })
})
