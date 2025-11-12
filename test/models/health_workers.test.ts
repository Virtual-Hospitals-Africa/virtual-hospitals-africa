import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as employment from '../../db/models/employment.ts'
import * as organizations from '../../db/models/organizations.ts'
import omit from '../../util/omit.ts'
import db from '../../db/db.ts'
import { upsertWithGoogleCredentials } from '../../db/models/health_worker_google_tokens.ts'
import { exists } from '../../util/exists.ts'
import assertSome from '../../util/assertSome.ts'
import assertLength from '../../util/assertLength.ts'
import { testHealthWorker } from '../_helpers/health_workers.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { TEST_ORGANIZATION_UUIDS } from '../_helpers/organizations.ts'

describe('db/models/health_workers.ts', () => {
  afterAll(() => db.destroy())
  describe('upsertWithGoogleCredentials', () => {
    it(
      'works even if a previous health worker without tokens was inserted',
      async () => {
        const health_worker_data = testHealthWorker()

        await health_workers.upsert(
          db,
          omit(health_worker_data, [
            'access_token',
            'refresh_token',
            'expires_at',
            'expires_in',
          ]),
        )

        const result = await upsertWithGoogleCredentials(
          db,
          health_worker_data,
        )

        assert(result)
        // deno-lint-ignore no-explicit-any
        const { access_token, refresh_token, expires_at, avatar_media_id, ...result_without_tokens } = result as any
        assertEquals(
          await health_workers.getById(db, result.id),
          {
            ...result_without_tokens,
            organizations: [],
            // deno-lint-ignore no-explicit-any
          } as any,
        )
        assert(!!access_token)
        assert(!!refresh_token)
      },
    )
  })

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
          avatar_url: null,
          email: health_worker.email,
          organizations: [
            {
              ...test_clinic,
              roles: [{
                profession: 'nurse',
                employment_id: health_worker.employee_id,
                specialty: null,
                department_ids: result.organizations[0].roles[0].department_ids,
              }],
            },
          ],
        })

        assertLength(result.organizations[0].roles[0].department_ids, 3)
        assertSome(
          result.organizations[0].roles[0].department_ids,
          (department_id) =>
            test_clinic.departments.find((d) => d.id === department_id)
              ?.name === 'primary care',
        )
        assertSome(
          result.organizations[0].roles[0].department_ids,
          (department_id) =>
            test_clinic.departments.find((d) => d.id === department_id)
              ?.name === 'triage',
        )
        assertSome(
          result.organizations[0].roles[0].department_ids,
          (department_id) =>
            test_clinic.departments.find((d) => d.id === department_id)
              ?.name === 'reception',
        )
      },
    )

    it(
      'handles a health worker who is both a nurse and admin at one organization',
      async () => {
        const getting_test_clinic = organizations.getById(
          db,
          TEST_ORGANIZATION_UUIDS.ZA.clinic,
        )

        const health_worker = await addTestEmployee(db, {
          profession: 'nurse',
          registration_status: 'approved',
        })

        const test_clinic = await getting_test_clinic

        const admin_department_id = exists(
          test_clinic.departments.find((d) => d.name === 'administration'),
        ).id
        await employment.addOne(db, {
          health_worker_id: health_worker.id,
          profession: 'admin',
          organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic,
          department_ids: [admin_department_id],
        })

        const result = await health_workers.getById(db, health_worker.id)

        assertLength(result.organizations, 1)
        assertLength(result.organizations[0].roles, 2)

        assertEquals(result.organizations[0].roles, [
          {
            'employment_id': result.organizations[0].roles[0].employment_id,
            'profession': 'admin',
            'specialty': null,
            'department_ids': [
              admin_department_id,
            ],
          },
          {
            'employment_id': result.organizations[0].roles[1].employment_id,
            'profession': 'nurse',
            'specialty': null,
            'department_ids': [
              exists(
                test_clinic.departments.find((d) => d.name === 'primary care'),
              ).id,
              exists(
                test_clinic.departments.find((d) => d.name === 'reception'),
              ).id,
              exists(
                test_clinic.departments.find((d) => d.name === 'triage'),
              ).id,
            ],
          },
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
          test_clinic.departments.find((d) => d.name === 'administration'),
        ).id
        await employment.addOne(db, {
          health_worker_id: health_worker.id,
          profession: 'receptionist',
          organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic,
          department_ids: [reception_department_id],
        })

        const result = await health_workers.getById(db, health_worker.id)

        assertLength(result.organizations, 2)
        assertEquals(
          result.organizations[0].id,
          TEST_ORGANIZATION_UUIDS.ZA.hospital,
        )
        assertLength(result.organizations[0].roles, 1)
        assertEquals(result.organizations[0].roles[0].profession, 'doctor')
        assertEquals(
          result.organizations[1].id,
          TEST_ORGANIZATION_UUIDS.ZA.clinic,
        )
        assertEquals(
          result.organizations[1].roles[0].profession,
          'receptionist',
        )
      },
    )
  })
})
