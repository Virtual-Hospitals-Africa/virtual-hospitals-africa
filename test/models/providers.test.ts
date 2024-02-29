import { describe } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as providers from '../../db/models/providers.ts'
import * as employment from '../../db/models/employment.ts'
import { addTestHealthWorker, itUsesTrxAnd } from '../web/utilities.ts'
import last from '../../util/last.ts'
import generateUUID from '../../util/uuid.ts'

describe('db/models/providers.ts', { sanitizeResources: false }, () => {
  describe('search', () => {
    itUsesTrxAnd(
      'returns providers matching a search with their employment information',
      async (trx) => {
        const healthWorker = await addTestHealthWorker(trx, {
          scenario: 'nurse',
        })

        const result = await providers.search(trx, {
          search: healthWorker.name,
        })
        assertEquals(result.length, 1)
        assertEquals(
          result[0],
          {
            avatar_url: healthWorker.avatar_url,
            email: healthWorker.email,
            facilities: [
              {
                provider_id: healthWorker.employee_id!,
                facility_id: 1,
                facility_name: 'VHA Test Clinic',
                professions: [
                  'nurse',
                ],
              },
            ],
            name: healthWorker.name,
            health_worker_id: healthWorker.id,
            description: [
              'nurse @ VHA Test Clinic',
            ],
          },
        )
      },
    )

    itUsesTrxAnd('searches by profession', async (trx) => {
      const healthWorker = await addTestHealthWorker(trx, { scenario: 'nurse' })

      const doctor_result = await providers.search(trx, {
        search: healthWorker.name,
        professions: ['doctor'],
      })
      assert(doctor_result)
      assertEquals(doctor_result.length, 0)

      const nurse_result = await providers.search(trx, {
        search: healthWorker.name,
        professions: ['nurse'],
      })
      assert(nurse_result)
      assertEquals(nurse_result.length, 1)

      assertEquals(
        nurse_result[0],
        {
          avatar_url: healthWorker.avatar_url,
          email: healthWorker.email,
          facilities: [
            {
              provider_id: healthWorker.employee_id!,
              facility_id: 1,
              facility_name: 'VHA Test Clinic',
              professions: [
                'nurse',
              ],
            },
          ],
          health_worker_id: healthWorker.id,
          name: healthWorker.name,
          description: [
            'nurse @ VHA Test Clinic',
          ],
        },
      )
    })

    itUsesTrxAnd(
      'can prioritize a given facility, while still returning results from another facility',
      async (trx) => {
        const name_base = generateUUID()
        const [_doctor1, doctor2] = await Promise.all([
          addTestHealthWorker(trx, {
            scenario: 'doctor',
            facility_id: 1,
            health_worker_attrs: {
              name: name_base + generateUUID(),
            },
          }),
          addTestHealthWorker(trx, {
            scenario: 'doctor',
            facility_id: 2,
            health_worker_attrs: {
              name: name_base + generateUUID(),
            },
          }),
        ])
        await employment.add(trx, [{
          health_worker_id: doctor2.id,
          profession: 'doctor',
          facility_id: 3,
        }])

        const results = await providers.search(trx, {
          search: name_base,
          prioritize_facility_id: 2,
        })
        const firstResult = results[0]
        const lastResult = last(results)!

        assert(
          firstResult.facilities.some((facility) => facility.facility_id === 2),
        )
        assert(
          lastResult.facilities.every((facility) => facility.facility_id !== 2),
        )
      },
    )

    itUsesTrxAnd('can filter by facility_id', async (trx) => {
      const healthWorker = await addTestHealthWorker(trx, { scenario: 'nurse' })

      await employment.add(trx, [{
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        facility_id: 2,
      }])

      const same_facility_result = await providers.search(trx, {
        search: healthWorker.name,
        facility_id: 1,
      })
      assertEquals(same_facility_result.length, 1)
      assertEquals(
        same_facility_result[0],
        {
          avatar_url: healthWorker.avatar_url,
          email: healthWorker.email,
          facilities: [
            {
              provider_id: healthWorker.employee_id!,
              facility_id: 1,
              facility_name: 'VHA Test Clinic',
              professions: [
                'nurse',
              ],
            },
          ],
          name: healthWorker.name,
          health_worker_id: healthWorker.id,
          description: [
            'nurse @ VHA Test Clinic',
          ],
        },
      )

      const other_facility_result = await providers.search(trx, {
        search: healthWorker.name,
        facility_id: 10,
      })
      assertEquals(other_facility_result.length, 0)
    })
  })
})
