import { describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as devices from '../../db/models/devices.ts'
import * as facility_rooms from '../../db/models/facility_rooms.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'

describe('db/models/facility_rooms.ts', { sanitizeResources: false }, () => {
  describe('Add device and Checks if the specefic test is available in the facility', () => {
    itUsesTrxAnd(
      'inserts addresses, returning an already existing address if it matches an existing ward, suburb, and street',
      async (trx) => {
        const device = (await devices.search(trx, null))[0]
        const availableTest = device.test_availability[0]

        facility_rooms.addFacilityDevice(trx, 1, {
          device_serial: '01',
          device_id: device.id,
          room_id: 0,
        })

        const facilityAvailableTests =
          await facility_rooms.getAvailableTestsInFacility(trx, {
            facility_id: 1,
          })

        assertEquals(
          facilityAvailableTests.indexOf(availableTest.name) > -1,
          true
        )
      }
    )
  })
})
