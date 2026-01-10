import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { health_workers } from '../../db/models/health_workers.ts'
import { employment } from '../../db/models/employment.ts'
import { organizations } from '../../db/models/organizations.ts'
import db from '../../db/db.ts'
import { exists } from '../../util/exists.ts'
import assertSome from '../../util/assertSome.ts'
import assertLength from '../../util/assertLength.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { TEST_ORGANIZATION_UUIDS } from '../_helpers/organizations.ts'
import { healthWorkerOrganizationDepartmentNames } from '../../shared/departments.ts'

describe('db/models/health_workers.ts', () => {
  afterAll(() => db.destroy())

  describe('getById', () => {
    it(
      'returns the health worker and their employment information',
      async () => {
        const getting_test_clinic = organizations.getById(
          db,
          TEST_ORGANIZATION_UUIDS.ZA.clinic,
        )

        const health_worker = await addTestEmployee(db, {
          profession: 'nurse',
          registration_status: 'not started',
        })

        const result = await health_workers.getById(db, health_worker.id)
        const test_clinic = await getting_test_clinic

        assertEquals(result, {
          id: health_worker.id,
          name: health_worker.name,
          first_names: health_worker.first_names,
          surname: health_worker.surname,
          preferred_name: health_worker.preferred_name,
          avatar_url: `/health_workers/${result.id}/avatar`,
          email: health_worker.email,
          organizations: [
            {
              ...test_clinic,
              profession: 'nurse',
              is_admin: false,
              employment_id: health_worker.employee_id,
              specialty: 'Primary care',
              department_ids: result.organizations[0].department_ids,
            },
          ],
        })

        assertLength(result.organizations[0].department_ids, 3)
        assertSome(
          result.organizations[0].department_ids,
          (department_id) =>
            test_clinic.departments.find((d) => d.id === department_id)
              ?.name === 'Primary care',
        )
        assertSome(
          result.organizations[0].department_ids,
          (department_id) =>
            test_clinic.departments.find((d) => d.id === department_id)
              ?.name === 'Triage',
        )
        assertSome(
          result.organizations[0].department_ids,
          (department_id) =>
            test_clinic.departments.find((d) => d.id === department_id)
              ?.name === 'Reception',
        )
      },
    )

    it(
      'handles a health worker who is both a nurse and admin at one organization',
      async () => {
        const health_worker = await addTestEmployee(db, {
          profession: 'nurse',
          registration_status: 'approved',
          is_admin: true,
        })

        const result = await health_workers.getById(db, health_worker.id)

        assertLength(result.organizations, 1)
        assertEquals(result.organizations[0].profession, 'nurse')
        assertEquals(result.organizations[0].is_admin, true)

        const department_names = healthWorkerOrganizationDepartmentNames(
          result,
          result.organizations[0].id,
        )
        assertEquals(department_names, [
          'Primary care',
          'Reception',
          'Triage',
          'Administration',
        ])
      },
    )

    it(
      'handles a health worker who is a doctor at one organization and a receptionist in another ordering hospitals first',
      async () => {
        const getting_test_clinic = organizations.getById(
          db,
          TEST_ORGANIZATION_UUIDS.ZA.clinic,
        )

        const health_worker = await addTestEmployee(db, {
          profession: 'doctor',
          registration_status: 'approved',
          organization_id: TEST_ORGANIZATION_UUIDS.ZA.hospital,
        })

        const test_clinic = await getting_test_clinic

        const reception_department_id = exists(
          test_clinic.departments.find((d) => d.name === 'Administration'),
        ).id
        await employment.addOne(db, {
          health_worker_id: health_worker.id,
          profession: 'receptionist',
          is_admin: false,
          organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic,
          department_ids: [reception_department_id],
        })

        const result = await health_workers.getById(db, health_worker.id)

        assertLength(result.organizations, 2)
        assertEquals(
          result.organizations[0].id,
          TEST_ORGANIZATION_UUIDS.ZA.hospital,
        )
        assertEquals(result.organizations[0].profession, 'doctor')
        assertEquals(
          result.organizations[1].id,
          TEST_ORGANIZATION_UUIDS.ZA.clinic,
        )
        assertEquals(
          result.organizations[1].profession,
          'receptionist',
        )
      },
    )
  })
})
