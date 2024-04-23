import { describe } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
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
            organization_id: '00000000-0000-0000-0000-000000000001',
            organization_name: 'VHA Test Clinic',
            profession: 'nurse',
            name: healthWorker.name,
            health_worker_id: healthWorker.id,
            description: 'nurse @ VHA Test Clinic',
            id: healthWorker.employee_id!,
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
          organization_id: '00000000-0000-0000-0000-000000000001',
          organization_name: 'VHA Test Clinic',
          profession: 'nurse',
          health_worker_id: healthWorker.id,
          name: healthWorker.name,
          description: 'nurse @ VHA Test Clinic',
          id: healthWorker.employee_id!,
        },
      )
    })

    itUsesTrxAnd(
      'can prioritize a given organization, while still returning results from another organization',
      async (trx) => {
        const name_base = generateUUID()
        const [_doctor1, doctor2] = await Promise.all([
          addTestHealthWorker(trx, {
            scenario: 'doctor',
            organization_id: '00000000-0000-0000-0000-000000000001',
            health_worker_attrs: {
              name: name_base + generateUUID(),
            },
          }),
          addTestHealthWorker(trx, {
            scenario: 'doctor',
            organization_id: '00000000-0000-0000-0000-000000000002',
            health_worker_attrs: {
              name: name_base + generateUUID(),
            },
          }),
        ])

        const results = await providers.search(trx, {
          search: name_base,
          prioritize_organization_id: '00000000-0000-0000-0000-000000000002',
        })
        const firstResult = results[0]
        const lastResult = last(results)!

        assertEquals(
          firstResult.organization_id,
          '00000000-0000-0000-0000-000000000002',
        )
        assertNotEquals(
          lastResult.organization_id,
          '00000000-0000-0000-0000-000000000002',
        )
      },
    )

    itUsesTrxAnd('can filter by organization_id', async (trx) => {
      const healthWorker = await addTestHealthWorker(trx, { scenario: 'nurse' })

      await employment.add(trx, [{
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        organization_id: '00000000-0000-0000-0000-000000000002',
      }])

      const same_organization_result = await providers.search(trx, {
        search: healthWorker.name,
        organization_id: '00000000-0000-0000-0000-000000000001',
      })
      assertEquals(same_organization_result.length, 1)
      assertEquals(
        same_organization_result[0],
        {
          id: healthWorker.employee_id!,
          avatar_url: healthWorker.avatar_url,
          email: healthWorker.email,
          organization_id: '00000000-0000-0000-0000-000000000001',
          organization_name: 'VHA Test Clinic',
          name: healthWorker.name,
          health_worker_id: healthWorker.id,
          description: 'nurse @ VHA Test Clinic',
          profession: 'nurse',
        },
      )

      const other_organization_result = await providers.search(trx, {
        search: healthWorker.name,
        organization_id: '00000000-0000-0000-0000-000000000010',
      })
      assertEquals(other_organization_result.length, 0)
    })
  })
})
