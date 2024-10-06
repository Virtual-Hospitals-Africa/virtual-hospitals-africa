import { describe } from 'std/testing/bdd.ts'
// import { assertEquals } from 'std/assert/assert_equals.ts'
// import * as address from '../../db/models/address.ts'
// import { createTestAddress } from '../mocks.ts'
// import omit from '../../util/omit.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'

describe('db/models/address.ts', { sanitizeResources: false }, () => {
  describe('upsert', () => {
    itUsesTrxAnd.skip(
      'inserts addresses, returning an already existing address if it matches an existing ward, suburb, and street',
      async (_trx) => {
        // const randomAddress = await createTestAddress(trx)

        // const address1 = await address.upsert(trx, randomAddress)
        // const address2 = await address.upsert(trx, randomAddress)

        // assertEquals(
        //   omit(address1, ['updated_at']),
        //   omit(address2, ['updated_at']),
        // )
      },
    )
  })
})
