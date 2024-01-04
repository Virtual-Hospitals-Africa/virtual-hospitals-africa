import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import * as address from '../../db/models/address.ts'
import { assert } from 'std/assert/assert.ts'
import { createTestAddress } from '../mocks.ts'
import omit from '../../util/omit.ts'

describe('db/models/address.ts', { sanitizeResources: false }, () => {
  beforeEach(resetInTest)

  describe('upsert', () => {
    it('inserts addresses, returning an already existing address if it matches an existing ward, suburb, and street', async () => {
      const randomAddress = await createTestAddress()

      const address1 = await address.upsert(db, randomAddress)
      const address2 = await address.upsert(db, randomAddress)

      assertEquals(
        omit(address1, ['updated_at']),
        omit(address2, ['updated_at']),
      )
      const { countAfterInitialInsert } = await db
        .selectFrom('address')
        .select(db.fn.countAll().as('countAfterInitialInsert'))
        .executeTakeFirstOrThrow()

      assertEquals(countAfterInitialInsert, 1n)

      const address3 = await address.upsert(db, {
        ...randomAddress,
        street: 'different street',
      })

      assert(address3.id != address1.id)

      const { countAfterSubsequentInsert } = await db
        .selectFrom('address')
        .select(db.fn.countAll().as('countAfterSubsequentInsert'))
        .executeTakeFirstOrThrow()

      assertEquals(countAfterSubsequentInsert, 2n)
    })
  })
})
