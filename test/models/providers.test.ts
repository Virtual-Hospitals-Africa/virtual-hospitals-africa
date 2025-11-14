import { afterAll, describe } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import * as employees from '../../db/models/employees.ts'
import * as organizations from '../../db/models/organizations.ts'
import * as employment from '../../db/models/employment.ts'
import last from '../../util/last.ts'
import generateUUID from '../../util/uuid.ts'
import db from '../../db/db.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { TEST_ORGANIZATION_UUIDS } from '../_helpers/organizations.ts'
import assertLength from '../../util/assertLength.ts'
import { assertArrayNonEmpty } from '../../util/arraySize.ts'
import first from '../../util/first.ts'

describe('db/models/employees.ts', () => {
  afterAll(() => db.destroy())

  describe('search', () => {
    itUsesTrxAnd(
      'returns providers matching a search with their employment information',
      async (trx) => {
        const health_worker = await addTestEmployee(trx, {
          profession: 'nurse',
          registration_status: 'not started',
        })

        const { results } = await employees.search(trx, {
          search: health_worker.name,
        })
        assertEquals(results.length, 1)
        const [result] = results
        assertLength(result.organizations[0].department_ids, 3)
        assertEquals(result, {
          'id': result.id,
          'name': result.name,
          'first_names': 'Test Health Worker',
          'surname': result.surname,
          'preferred_name': 'Test',
          'email': result.email,
          'avatar_url': `/health_workers/${result.id}/avatar`,
          'employee_id': result.employee_id,
          'organization_id': '00000000-0000-0000-0000-000000000001',
          'profession': 'nurse',
          'is_admin': false,
          'specialty': null,
          'href':
            `/app/organizations/00000000-0000-0000-0000-000000000001/employees/${result.id}`,
          'organizations': [
            {
              ...await organizations.getById(
                trx,
                TEST_ORGANIZATION_UUIDS.ZA.clinic,
              ),
              'employment_id': health_worker.employee_id,
              'profession': 'nurse',
              'is_admin': false,
              'specialty': null,
              'department_ids': result.organizations[0].department_ids,
            },
          ],
        })
      },
    )

    itUsesTrxAnd('searches by profession', async (trx) => {
      const health_worker = await addTestEmployee(trx, {
        profession: 'nurse',
        registration_status: 'not started',
      })

      const doctor_search = await employees.search(trx, {
        search: health_worker.name,
        professions: ['doctor'],
      })
      assert(doctor_search.results)
      assertLength(doctor_search.results, 0)

      const nurse_search = await employees.search(trx, {
        search: health_worker.name,
        professions: ['nurse'],
      })
      assert(nurse_search)
      assertLength(nurse_search.results, 1)
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

        const { results } = await employees.search(trx, {
          search: name_base,
          prioritize_organization_id: '00000000-0000-0000-0000-000000000002',
        })
        assertArrayNonEmpty(results)
        const first_result = first(results)
        const last_result = last(results)

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

      await employment.addOne(trx, {
        health_worker_id: health_worker.id,
        profession: 'nurse',
        organization_id: '00000000-0000-0000-0000-000000000002',
        is_admin: false,
      })

      const same_organization_search = await employees.search(trx, {
        search: health_worker.name,
        organization_id: '00000000-0000-0000-0000-000000000001',
      })
      assertLength(same_organization_search.results, 1)
      assertEquals(
        same_organization_search.results[0].organization_id,
        TEST_ORGANIZATION_UUIDS.ZA.clinic,
      )

      const other_organization_search = await employees.search(trx, {
        search: health_worker.name,
        organization_id: '00000000-0000-0000-0000-000000000010',
      })
      assertLength(other_organization_search.results, 0)
    })
  })
})
