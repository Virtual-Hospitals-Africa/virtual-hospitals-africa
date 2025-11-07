import { afterAll, describe } from 'std/testing/bdd.ts'
import * as addresses from '../../db/models/addresses.ts'

import omit from '../../util/omit.ts'

import db from '../../db/db.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'
import createTestAddress from '../../mocks/createTestAddress.ts'

describe('db/models/address.ts', () => {
  afterAll(() => db.destroy())

  describe('upsert', () => {
    itUsesTrxAnd(
      'inserts addresses, making a new id each time',
      async (trx) => {
        const random_address = await createTestAddress()

        const address1 = await addresses.insert(trx, random_address)
        const address2 = await addresses.insert(trx, random_address)

        assertNotEquals(
          omit(address1, ['created_at', 'updated_at']),
          omit(address2, ['created_at', 'updated_at']),
        )
      },
    )
  })
})
