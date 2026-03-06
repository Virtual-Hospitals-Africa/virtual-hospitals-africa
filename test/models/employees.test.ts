import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { employment } from '../../db/models/employment.ts'
import { organizations } from '../../db/models/organizations.ts'
import db from '../../db/db.ts'
import { exists } from '../../util/exists.ts'
import assertLength from '../../util/assertLength.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { createTestOrganization, TEST_ORGANIZATION_UUIDS } from '../_helpers/organizations.ts'
import { employees } from '../../db/models/employees.ts'
import { afterAll } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { assertArrayNonEmpty } from '../../util/arraySize.ts'
import first from '../../util/first.ts'
import last from '../../util/last.ts'
import generateUUID from '../../util/uuid.ts'
import { organizations_with_departments } from '../../db/models/organizations_with_departments.ts'
import { assertMatches } from '../../util/assertMatches.ts'

describeParallel('db/models/employees.ts', () => {
  afterAll(() => db.destroy())
  itParallel(
    'handles a health worker who is a doctor at one organization and a receptionist in another ordering hospitals first',
    async () => {
      const getting_test_clinic = organizations_with_departments.getById(
        db,
        TEST_ORGANIZATION_UUIDS.ZA.clinic,
      )

      const health_worker = await addTestEmployee(db, {
        role: 'doctor',

        organization_id: TEST_ORGANIZATION_UUIDS.ZA.hospital,
      })

      const test_clinic = await getting_test_clinic

      const reception_department_id = exists(
        test_clinic.departments.find((d) => d.name === 'Administration'),
      ).id
      const receptionist_employment = await employment.addOne(db, {
        health_worker_id: health_worker.id,
        role: 'receptionist',
        is_admin: false,
        organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic,
        department_ids: [reception_department_id],
      })

      const doctor_result = await employees.getById(
        db,
        health_worker.employee_id,
      )

      assertLength(doctor_result.organizations, 2)
      assertEquals(
        doctor_result.organizations[0].id,
        TEST_ORGANIZATION_UUIDS.ZA.hospital,
      )

      assertEquals(doctor_result.organizations[0].role, 'doctor')
      assertEquals(
        doctor_result.organizations[1].id,
        TEST_ORGANIZATION_UUIDS.ZA.clinic,
      )
      assertEquals(
        doctor_result.organizations[1].role,
        'receptionist',
      )
      assertEquals(
        doctor_result.employee_id,
        health_worker.employee_id,
      )
      assertEquals(
        doctor_result.organization_id,
        TEST_ORGANIZATION_UUIDS.ZA.hospital,
      )
      assertEquals(
        doctor_result.role,
        'doctor',
      )

      const receptionist_result = await employees.getById(
        db,
        receptionist_employment.id,
      )

      assertLength(receptionist_result.organizations, 2)
      assertEquals(
        receptionist_result.organizations[0].id,
        TEST_ORGANIZATION_UUIDS.ZA.hospital,
      )

      assertEquals(
        receptionist_result.organizations[0].role,
        'doctor',
      )
      assertEquals(
        receptionist_result.organizations[1].id,
        TEST_ORGANIZATION_UUIDS.ZA.clinic,
      )
      assertEquals(
        receptionist_result.organizations[1].role,
        'receptionist',
      )
      assertEquals(
        receptionist_result.employee_id,
        receptionist_employment.id,
      )
      assertEquals(
        receptionist_result.organization_id,
        TEST_ORGANIZATION_UUIDS.ZA.clinic,
      )
      assertEquals(
        receptionist_result.role,
        'receptionist',
      )
    },
  )

  itParallel('can find employees who can do triage', async () => {
    const organization = await createTestOrganization(db)
    await Promise.all([
      addTestEmployee(db, {
        role: 'receptionist',

        organization_id: organization.id,
      }),
      addTestEmployee(db, {
        role: 'nurse',

        organization_id: organization.id,
      }),
    ])

    const can_perform_triage = await employees.findAll(db, {
      organization_id: organization.id,
      can_perform_workflow: 'triage',
    })
    assertLength(can_perform_triage, 1)
    assertEquals(can_perform_triage[0].role, 'nurse')
  })

  describeParallel('search', () => {
    itParallel(
      'returns providers matching a search with their employment information',
      async () => {
        const health_worker = await addTestEmployee(db, {
          role: 'nurse',
        })

        const { results } = await employees.search(db, {
          search: health_worker.name,
        })
        assertEquals(results.length, 1)
        const [result] = results
        assertLength(result.organizations[0].in_departments, 3)
        assertMatches(result, {
          'id': result.id,
          'name': result.name,
          'first_names': result.first_names,
          'surname': result.surname,
          'preferred_name': result.preferred_name,
          'email': result.email,
          'avatar_url': `/health_workers/${result.id}/avatar`,
          'employee_id': result.employee_id,
          'organization_id': '00000000-0000-1000-8000-000000000001',
          'role': 'nurse',
          'is_admin': false,
          'href': `/app/organizations/00000000-0000-1000-8000-000000000001/employees/${result.id}`,
          'organizations': [
            {
              ...await organizations.getById(
                db,
                TEST_ORGANIZATION_UUIDS.ZA.clinic,
              ),
              'employment_id': health_worker.employee_id,
              'role': 'nurse',
              'is_admin': false,
              'in_departments': result.organizations[0].in_departments,
            },
          ],
        })
      },
    )

    itParallel('searches by profession', async () => {
      const health_worker = await addTestEmployee(db, {
        role: 'nurse',
      })

      const doctor_search = await employees.search(db, {
        search: health_worker.name,
        roles: ['doctor'],
      })
      assert(doctor_search.results)
      assertLength(doctor_search.results, 0)

      const nurse_search = await employees.search(db, {
        search: health_worker.name,
        roles: ['nurse'],
      })
      assert(nurse_search)
      assertLength(nurse_search.results, 1)
    })

    itParallel(
      'can prioritize a given organization, while still returning results from another organization',
      async () => {
        const name_base = generateUUID()
        await Promise.all([
          addTestEmployee(db, {
            role: 'doctor',
            organization_id: '00000000-0000-1000-8000-000000000001',
            health_worker_attrs: {
              name: name_base + ' ' + generateUUID(),
            },
          }),
          addTestEmployee(db, {
            role: 'doctor',
            organization_id: '00000000-0000-1000-8000-000000000002',
            health_worker_attrs: {
              name: name_base + ' ' + generateUUID(),
            },
          }),
        ])

        const { results } = await employees.search(db, {
          search: name_base,
          prioritize_organization_id: '00000000-0000-1000-8000-000000000002',
        })
        assertArrayNonEmpty(results)
        const first_result = first(results)
        const last_result = last(results)

        assertEquals(
          first_result.organization_id,
          '00000000-0000-1000-8000-000000000002',
        )
        assertNotEquals(
          last_result.organization_id,
          '00000000-0000-1000-8000-000000000002',
        )
      },
    )

    itParallel('can filter by organization_id', async () => {
      const health_worker = await addTestEmployee(db, {
        role: 'nurse',
      })

      await employment.addOne(db, {
        health_worker_id: health_worker.id,
        role: 'nurse',
        organization_id: '00000000-0000-1000-8000-000000000002',
        is_admin: false,
      })

      const same_organization_search = await employees.search(db, {
        search: health_worker.name,
        organization_id: '00000000-0000-1000-8000-000000000001',
      })
      assertLength(same_organization_search.results, 1)
      assertEquals(
        same_organization_search.results[0].organization_id,
        TEST_ORGANIZATION_UUIDS.ZA.clinic,
      )

      const other_organization_search = await employees.search(db, {
        search: health_worker.name,
        organization_id: '00000000-0000-0000-0000-000000000010',
      })
      assertLength(other_organization_search.results, 0)
    })
  })
})
