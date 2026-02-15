import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { health_workers } from '../../db/models/health_workers.ts'
import { employment } from '../../db/models/employment.ts'
import db from '../../db/db.ts'
import { exists } from '../../util/exists.ts'
import omit from '../../util/omit.ts'
import assertSome from '../../util/assertSome.ts'
import assertLength from '../../util/assertLength.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { TEST_ORGANIZATION_UUIDS } from '../_helpers/organizations.ts'
import { healthWorkerOrganizationDepartmentNames } from '../../shared/departments.ts'
import { organizations_with_departments } from '../../db/models/organizations_with_departments.ts'

describe('db/models/health_workers.ts', () => {
  afterAll(() => db.destroy())

  describe('getById', () => {
    it(
      'returns the health worker and their employment information',
      async () => {
        const getting_test_clinic = organizations_with_departments.getById(
          db,
          TEST_ORGANIZATION_UUIDS.ZA.clinic,
        )

        const health_worker = await addTestEmployee(db, {
          profession: 'nurse',
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
              ...omit(test_clinic, ['departments']),
              profession: 'nurse',
              is_admin: false,
              employment_id: health_worker.employee_id,
              specialty: 'Primary care',
              in_departments: result.organizations[0].in_departments,
            },
          ],
        })

        assertLength(result.organizations[0].in_departments, 3)
        assertSome(
          result.organizations[0].in_departments,
          (department) => department.name === 'Primary care',
        )
        assertSome(
          result.organizations[0].in_departments,
          (department) => department.name === 'Triage',
        )
        assertSome(
          result.organizations[0].in_departments,
          (department) => department.name === 'Reception',
        )
      },
    )

    it(
      'handles a health worker who is both a nurse and admin at one organization',
      async () => {
        const health_worker = await addTestEmployee(db, {
          profession: 'nurse',

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
        const getting_test_clinic = organizations_with_departments.getById(
          db,
          TEST_ORGANIZATION_UUIDS.ZA.clinic,
        )

        const health_worker = await addTestEmployee(db, {
          profession: 'doctor',

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
