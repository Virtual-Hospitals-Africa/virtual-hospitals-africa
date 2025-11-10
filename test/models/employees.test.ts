import { assertEquals } from 'std/assert/assert_equals.ts'
import * as employment from '../../db/models/employment.ts'
import * as organizations from '../../db/models/organizations.ts'
import db from '../../db/db.ts'
import { exists } from '../../util/exists.ts'
import assertLength from '../../util/assertLength.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { TEST_ORGANIZATION_UUIDS } from '../_helpers/organizations.ts'
import * as employees from '../../db/models/employees.ts'
import { describe, it } from 'node:test'

describe('db/models/employees.ts ', () => {
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
        test_clinic.departments.find((d) => d.name === 'administration'),
      ).id
      const receptionist_employment = await employment.addOne(db, {
        health_worker_id: health_worker.id,
        profession: 'receptionist',
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
      assertLength(doctor_result.organizations[0].roles, 1)
      assertEquals(doctor_result.organizations[0].roles[0].profession, 'doctor')
      assertEquals(
        doctor_result.organizations[1].id,
        TEST_ORGANIZATION_UUIDS.ZA.clinic,
      )
      assertEquals(
        doctor_result.organizations[1].roles[0].profession,
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
        doctor_result.profession,
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
      assertLength(receptionist_result.organizations[0].roles, 1)
      assertEquals(
        receptionist_result.organizations[0].roles[0].profession,
        'doctor',
      )
      assertEquals(
        receptionist_result.organizations[1].id,
        TEST_ORGANIZATION_UUIDS.ZA.clinic,
      )
      assertEquals(
        receptionist_result.organizations[1].roles[0].profession,
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
        receptionist_result.profession,
        'receptionist',
      )
    },
  )
})
