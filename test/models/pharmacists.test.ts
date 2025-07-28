import { afterAll, describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as pharmacists from '../../db/models/pharmacists.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'
import { assert } from 'std/assert/assert.ts'
import db from '../../db/db.ts'

describe('db/models/pharmacists.ts', () => {
  afterAll(() => db.destroy())
  describe('getById', () => {
    itUsesTrxAnd(
      'works',
      async (trx) => {
        const { id } = await trx.selectFrom('pharmacists').select('id')
          .executeTakeFirstOrThrow()
        const result = await pharmacists.getById(trx, id)
        assert(result)
        assertEquals(result, {
          id,
          licence_number: 'C01-0115-2023',
          prefix: 'Mrs',
          given_name: 'HUHUYANA',
          family_name: 'WINNIA',
          name: 'Mrs. HUHUYANA WINNIA',
          address: 'B A T ZIMBABWE CLINIC NO 1 MANCHESTER ROAD SOUTHERTON',
          town: 'HARARE',
          address_display:
            'B A T ZIMBABWE CLINIC NO 1 MANCHESTER ROAD SOUTHERTON, HARARE',
          href: `/regulator/ZW/pharmacists/${id}`,
          expiry_date: '2024-09-30',
          pharmacist_type: 'Ind Clinic Nurse',
          country: 'ZW',
          pharmacies: [{
            id: result.pharmacies[0].id,
            address: 'NO 1 MANCHESTER ROAD',
            town: 'HARARE',
            address_display: 'NO 1 MANCHESTER ROAD, HARARE',
            expiry_date: '2024-09-30',
            licence_number: 'I03-P0082-2023',
            licensee: 'B A T ZIMBABWE LTD',
            name: 'B A T ZIMBABWE CLINIC',
            pharmacies_types: 'Clinics: Class C',
            href: `/regulator/ZW/pharmacies/${result.pharmacies[0].id}`,
            is_supervisor: true,
            country: 'ZW',
          }],
          actions: {
            view: `/regulator/ZW/pharmacists/${id}`,
            revoke: `/regulator/ZW/pharmacists/${id}/revoke`,
            edit: `/regulator/ZW/pharmacists/${id}/edit`,
          },
        })
      },
    )
  })
})
