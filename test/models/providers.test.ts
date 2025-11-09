import { afterAll, describe } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import * as providers from '../../db/models/providers.ts'
import * as employment from '../../db/models/employment.ts'
import last from '../../util/last.ts'
import generateUUID from '../../util/uuid.ts'
import db from '../../db/db.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'
import { addTestEmployee } from '../_helpers/employees.ts'

describe('db/models/providers.ts', () => {
  afterAll(() => db.destroy())

  describe('search', () => {
    itUsesTrxAnd(
      'returns providers matching a search with their employment information',
      async (trx) => {
        const health_worker = await addTestEmployee(trx, {
          profession: 'nurse',
          registration_status: 'not started',
        })

        const result = await providers.search(trx, {
          search: health_worker.name,
        })
        assertEquals(result.length, 1)
        assertEquals(
          result[0],
          {
            avatar_url: health_worker.avatar_url,
            email: health_worker.email,
            organization_id: '00000000-0000-0000-0000-000000000001',
            organization_name: 'VHA Test Clinic South Africa',
            profession: 'nurse',
            name: health_worker.name,
            health_worker_id: health_worker.id,
            description: 'nurse @ VHA Test Clinic South Africa',
            id: health_worker.employee_id,
          },
        )
      },
    )

    itUsesTrxAnd('searches by profession', async (trx) => {
      const health_worker = await addTestEmployee(trx, {
        profession: 'nurse',
        registration_status: 'not started',
      })

      const doctor_result = await providers.search(trx, {
        search: health_worker.name,
        professions: ['doctor'],
      })
      assert(doctor_result)
      assertEquals(doctor_result.length, 0)

      const nurse_result = await providers.search(trx, {
        search: health_worker.name,
        professions: ['nurse'],
      })
      assert(nurse_result)
      assertEquals(nurse_result.length, 1)

      assertEquals(
        nurse_result[0],
        {
          avatar_url: health_worker.avatar_url,
          email: health_worker.email,
          organization_id: '00000000-0000-0000-0000-000000000001',
          organization_name: 'VHA Test Clinic South Africa',
          profession: 'nurse',
          health_worker_id: health_worker.id,
          name: health_worker.name,
          description: 'nurse @ VHA Test Clinic South Africa',
          id: health_worker.employee_id,
        },
      )
    })

    itUsesTrxAnd(
      'can prioritize a given organization, while still returning results from another organization',
      async (trx) => {
        const name_base = generateUUID()
        await Promise.all([
          addTestEmployee(trx, {
            profession: 'doctor',
            organization_id: '00000000-0000-0000-0000-000000000001',
            health_worker_attrs: {
              name: name_base + ' ' + generateUUID(),
            },
          }),
          addTestEmployee(trx, {
            profession: 'doctor',
            organization_id: '00000000-0000-0000-0000-000000000002',
            health_worker_attrs: {
              name: name_base + ' ' + generateUUID(),
            },
          }),
        ])

        const results = await providers.search(trx, {
          search: name_base,
          prioritize_organization_id: '00000000-0000-0000-0000-000000000002',
        })
        const first_result = results[0]
        const last_result = last(results)!

        assertEquals(
          first_result.organization_id,
          '00000000-0000-0000-0000-000000000002',
        )
        assertNotEquals(
          last_result.organization_id,
          '00000000-0000-0000-0000-000000000002',
        )
      },
    )

    itUsesTrxAnd('can filter by organization_id', async (trx) => {
      const health_worker = await addTestEmployee(trx, {
        profession: 'nurse',
        registration_status: 'not started',
      })

      await employment.add(trx, [{
        health_worker_id: health_worker.id,
        profession: 'nurse',
        organization_id: '00000000-0000-0000-0000-000000000002',
      }])

      const same_organization_result = await providers.search(trx, {
        search: health_worker.name,
        organization_id: '00000000-0000-0000-0000-000000000001',
      })
      assertEquals(same_organization_result.length, 1)
      assertEquals(
        same_organization_result[0],
        {
          id: health_worker.employee_id,
          avatar_url: health_worker.avatar_url,
          email: health_worker.email,
          organization_id: '00000000-0000-0000-0000-000000000001',
          organization_name: 'VHA Test Clinic South Africa',
          name: health_worker.name,
          health_worker_id: health_worker.id,
          description: 'nurse @ VHA Test Clinic South Africa',
          profession: 'nurse',
        },
      )

      const other_organization_result = await providers.search(trx, {
        search: health_worker.name,
        organization_id: '00000000-0000-0000-0000-000000000010',
      })
      assertEquals(other_organization_result.length, 0)
    })
  })
})
