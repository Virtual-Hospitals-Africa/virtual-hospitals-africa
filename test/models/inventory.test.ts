import { describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as devices from '../../db/models/devices.ts'
import * as inventory from '../../db/models/inventory.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'

describe('db/models/inventory.ts', { sanitizeResources: false }, () => {
  describe('getAvailableTestsInFacility', () => {
    itUsesTrxAnd(
      'Add device and Checks if the specefic test is available in the facility',
      async (trx) => {
        const device = (await devices.search(trx, null))[0]
        const availableTest = device.test_availability[0]

        await inventory.addFacilityDevice(trx, 1, {
          device_id: device.id,
          facility_id: 1,
        })

        const facilityAvailableTests = await inventory
          .getAvailableTestsInFacility(trx, {
            facility_id: 1,
          })

        assertEquals(
          facilityAvailableTests.filter(c=> c.name === availableTest.name) !== undefined,
          true,
        )
      },
    )
  })
})
