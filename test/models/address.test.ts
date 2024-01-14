import { describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as address from '../../db/models/address.ts'
import { assert } from 'std/assert/assert.ts'
import { createTestAddress } from '../mocks.ts'
import omit from '../../util/omit.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'
import generateUUID from '../../util/uuid.ts'

describe('db/models/address.ts', { sanitizeResources: false }, () => {
  describe('upsert', () => {
    itUsesTrxAnd(
      'inserts addresses, returning an already existing address if it matches an existing ward, suburb, and street',
      async (trx) => {
        const { countBeforeAll } = await trx
          .selectFrom('address')
          .select(trx.fn.countAll().as('countBeforeAll'))
          .executeTakeFirstOrThrow()

        const randomAddress = await createTestAddress(trx)

        const address1 = await address.upsert(trx, randomAddress)
        const address2 = await address.upsert(trx, randomAddress)

        assertEquals(
          omit(address1, ['updated_at']),
          omit(address2, ['updated_at']),
        )
        const { countAfterInitialInsert } = await trx
          .selectFrom('address')
          .select(trx.fn.countAll().as('countAfterInitialInsert'))
          .executeTakeFirstOrThrow()

        assertEquals(countAfterInitialInsert, 1n + (countBeforeAll as bigint))

        const address3 = await address.upsert(trx, {
          ...randomAddress,
          street: generateUUID(),
        })

        assert(address3.id != address1.id)

        const { countAfterSubsequentInsert } = await trx
          .selectFrom('address')
          .select(trx.fn.countAll().as('countAfterSubsequentInsert'))
          .executeTakeFirstOrThrow()

        assertEquals(
          countAfterSubsequentInsert,
          2n + (countBeforeAll as bigint),
        )
      },
    )
  })
})
