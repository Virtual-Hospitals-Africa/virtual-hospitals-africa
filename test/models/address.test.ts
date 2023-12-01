import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import * as address from '../../db/models/address.ts'
import { assert } from 'std/assert/assert.ts'
import sample from '../../util/sample.ts'

async function createRandomAddress() {
  const fullCountryInfo = await address.getFullCountryInfo(db)
  const country = sample(fullCountryInfo)
  const province = sample(country.provinces)
  const district = sample(province.districts)
  const ward = sample(district.wards)
  const suburb = ward.suburbs.length ? sample(ward.suburbs) : null
  const street = Math.random().toString(36).substring(7)
  return {
    street,
    suburb_id: suburb?.id,
    ward_id: ward.id,
    district_id: district.id,
    province_id: province.id,
    country_id: country.id,
  }
}

describe('db/models/address.ts', { sanitizeResources: false }, () => {
  beforeEach(resetInTest)

  describe('upsert', () => {
    it('inserts addresses, returning an already existing address if it matches an existing ward, suburb, and street', async () => {
      const randomAddress = await createRandomAddress()

      const address1 = await address.upsert(db, randomAddress)
      const address2 = await address.upsert(db, randomAddress)

      assertEquals(address1, address2)
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
