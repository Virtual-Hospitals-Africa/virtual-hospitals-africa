import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { testHealthWorker } from '../_helpers/health_workers.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as employment from '../../db/models/employment.ts'

import * as organizations from '../../db/models/organizations.ts'
import omit from '../../util/omit.ts'
import db from '../../db/db.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { upsertWithGoogleCredentials } from '../../db/models/health_worker_google_tokens.ts'
import { TEST_ORGANIZATION_UUIDS } from '../_helpers/organizations.ts'
import { exists } from '../../util/exists.ts'
import assertSome from '../../util/assertSome.ts'
import assertLength from '../../util/assertLength.ts'

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
        assertEquals(
          await health_workers.getById(db, result.id),
          {
            ...omit(result, [
              'access_token',
              'refresh_token',
              'expires_at',
            ]),
            organizations: [],
            // deno-lint-ignore no-explicit-any
          } as any,
        )
        assert(!!result.access_token)
        assert(!!result.refresh_token)
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
          avatar_url: health_worker.avatar_url,
          email: health_worker.email,
          organizations: [
            {
              ...test_clinic,
              roles: [{
                profession: 'nurse',
                employment_id: health_worker.employee_id,
                specialty: null,
                departments: result.organizations[0].roles[0].departments,
              }],
            },
          ],
        })

        assertLength(result.organizations[0].roles[0].departments, 3)
        assertSome(
          result.organizations[0].roles[0].departments,
          (department) => department.name === 'primary care',
        )
        assertSome(
          result.organizations[0].roles[0].departments,
          (department) => department.name === 'triage',
        )
        assertSome(
          result.organizations[0].roles[0].departments,
          (department) => department.name === 'reception',
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
            'departments': [
              {
                'id': admin_department_id,
                'name': 'administration',
              },
            ],
          },
          {
            'employment_id': result.organizations[0].roles[1].employment_id,
            'profession': 'nurse',
            'specialty': null,
            'departments': [
              {
                'id': exists(
                  test_clinic.departments.find((d) =>
                    d.name === 'primary care'
                  ),
                ).id,
                'name': 'primary care',
              },
              {
                'id': exists(
                  test_clinic.departments.find((d) => d.name === 'reception'),
                ).id,
                'name': 'reception',
              },
              {
                'id': exists(
                  test_clinic.departments.find((d) => d.name === 'triage'),
                ).id,
                'name': 'triage',
              },
            ],
          },
        ])
      },
    )

    it(
      'handles a health worker who is a doctor at one organization and a receptionist in another',
      async () => {
        const getting_test_hospital = organizations.getById(
          db,
          TEST_ORGANIZATION_UUIDS.ZA.hospital,
        )

        const getting_test_clinic = organizations.getById(
          db,
          TEST_ORGANIZATION_UUIDS.ZA.clinic,
        )

        const health_worker = await addTestEmployee(db, {
          profession: 'doctor',
          registration_status: 'approved',
          organization_id: TEST_ORGANIZATION_UUIDS.ZA.hospital,
        })

        const test_hospital = await getting_test_hospital
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
        assertLength(result.organizations[0].roles, 1)
        assertLength(result.organizations[1].roles, 1)

        assertEquals(result, {
          'id': 'f0cfb3e9-1da1-4b5c-a8fa-6bda5d9d1463',
          'name': 'Test Health Worker abaee60b-29eb-40c4-bf8e-b02d270dadc1',
          'first_names': 'Test Health Worker',
          'surname': 'abaee60b-29eb-40c4-bf8e-b02d270dadc1',
          'preferred_name': 'Test',
          'email': '9afb2c91-38d9-48ea-b917-3626ee2dca89@example.com',
          'avatar_url': '315fa96b-fd5a-4867-88b3-f5b7c0a73c22.com',
          'organizations': [
            {
              'id': '00000000-0000-0000-0000-000000000001',
              'name': 'VHA Test Clinic South Africa',
              'category': 'Clinic',
              'is_test': true,
              'country': 'ZA',
              'ownership': 'Govt.',
              'inactive_reason': null,
              'most_common_language_code': 'nso',
              'formatted_address':
                '123 Main St, Polokwane, South Africa, 23456',
              'description': '123 Main St, Polokwane, South Africa, 23456',
              'location': {
                'longitude': 29.7739353,
                'latitude': -19.4554096,
              },
              'departments': [
                {
                  'id': '31f5ce5f-ef1f-40fc-9211-47ecba65e8f8',
                  'name': 'administration',
                  'requires_triage': false,
                  'workflows': [],
                },
                {
                  'id': '1a1a1c07-6fa7-47e6-a5ba-e3dde60e4d8e',
                  'name': 'chronic diseases',
                  'requires_triage': true,
                  'workflows': [],
                },
                {
                  'id': 'a73f3063-5d3c-45f2-9b8c-1f22f789acc3',
                  'name': 'immunizations',
                  'requires_triage': true,
                  'workflows': [],
                },
                {
                  'id': 'e53954e6-dfcd-429d-9a71-ba3839b2ecd3',
                  'name': 'maternity',
                  'requires_triage': true,
                  'workflows': [
                    'maternity',
                  ],
                },
                {
                  'id': 'a330ed68-d1e0-4839-acec-2afbebd0e22f',
                  'name': 'pharmacy',
                  'requires_triage': false,
                  'workflows': [
                    'prescription_refill',
                  ],
                },
                {
                  'id': '4162b6ca-8ad3-4a91-a6cd-a2673b50b77c',
                  'name': 'primary care',
                  'requires_triage': true,
                  'workflows': [
                    'consultation',
                  ],
                },
                {
                  'id': '73f5b866-2dcc-423a-a9cf-937792729690',
                  'name': 'reception',
                  'requires_triage': false,
                  'workflows': [
                    'registration',
                  ],
                },
                {
                  'id': 'b1d25fc6-cedf-45e6-bfa6-162ae63c6d31',
                  'name': 'triage',
                  'requires_triage': false,
                  'workflows': [
                    'triage',
                  ],
                },
                {
                  'id': '5e9b789f-ffd1-4226-b414-e9b87c2049fc',
                  'name': 'waiting room',
                  'requires_triage': false,
                  'workflows': [],
                },
              ],
              'roles': [
                {
                  'employment_id': '44a9a3c4-a4e8-461c-be61-1c57276e3380',
                  'profession': 'receptionist',
                  'specialty': null,
                  'departments': [
                    {
                      'id': '31f5ce5f-ef1f-40fc-9211-47ecba65e8f8',
                      'name': 'administration',
                    },
                  ],
                },
                {
                  'employment_id': '2e4bc9a4-794e-422b-ac71-bbb281c78516',
                  'profession': 'doctor',
                  'specialty': null,
                  'departments': [
                    {
                      'id': '217b9408-0e39-4673-ae68-fea347a4d6a2',
                      'name': 'primary care',
                    },
                    {
                      'id': '32993943-690d-4c4c-9d86-c5a11c257a5e',
                      'name': 'reception',
                    },
                    {
                      'id': '56f91f28-d3b3-4ae7-9d24-03f04f1ecd9c',
                      'name': 'triage',
                    },
                  ],
                },
              ],
            },
            {
              'id': '00000000-0000-0000-0000-000000000002',
              'name': 'VHA Test Regional Medical Center South Africa',
              'category': 'Regional Medical Center',
              'is_test': true,
              'country': 'ZA',
              'ownership': 'Govt.',
              'inactive_reason': null,
              'most_common_language_code': 'nso',
              'formatted_address':
                '12356 Main St, Polokwane, South Africa, 23456',
              'description': '12356 Main St, Polokwane, South Africa, 23456',
              'location': {
                'longitude': 29.7738353,
                'latitude': -19.4555096,
              },
              'departments': [
                {
                  'id': '9b451b2e-d279-4b02-a1f7-f7e1b3d77bb3',
                  'name': 'administration',
                  'requires_triage': false,
                  'workflows': [],
                },
                {
                  'id': 'd2f399f7-d4be-4841-8a34-92c8fdc6ffa1',
                  'name': 'burns',
                  'requires_triage': true,
                  'workflows': [],
                },
                {
                  'id': '03c327f7-9e26-46e6-9662-492597829c84',
                  'name': 'oncology',
                  'requires_triage': true,
                  'workflows': [],
                },
                {
                  'id': '714bd9d3-0bf2-461f-8db6-2ae7a5921431',
                  'name': 'pharmacy',
                  'requires_triage': false,
                  'workflows': [
                    'prescription_refill',
                  ],
                },
                {
                  'id': '217b9408-0e39-4673-ae68-fea347a4d6a2',
                  'name': 'primary care',
                  'requires_triage': true,
                  'workflows': [
                    'consultation',
                  ],
                },
                {
                  'id': '32993943-690d-4c4c-9d86-c5a11c257a5e',
                  'name': 'reception',
                  'requires_triage': false,
                  'workflows': [
                    'registration',
                  ],
                },
                {
                  'id': '21ad7f01-5727-4ef9-8b25-700de88c48c3',
                  'name': 'remote care',
                  'requires_triage': true,
                  'workflows': [
                    'doctor_review',
                  ],
                },
                {
                  'id': '56f91f28-d3b3-4ae7-9d24-03f04f1ecd9c',
                  'name': 'triage',
                  'requires_triage': false,
                  'workflows': [
                    'triage',
                  ],
                },
                {
                  'id': '10e5d0ee-dd6b-4de0-a5f1-7051ac368633',
                  'name': 'waiting room',
                  'requires_triage': false,
                  'workflows': [],
                },
              ],
              'roles': [
                {
                  'employment_id': '44a9a3c4-a4e8-461c-be61-1c57276e3380',
                  'profession': 'receptionist',
                  'specialty': null,
                  'departments': [
                    {
                      'id': '31f5ce5f-ef1f-40fc-9211-47ecba65e8f8',
                      'name': 'administration',
                    },
                  ],
                },
                {
                  'employment_id': '2e4bc9a4-794e-422b-ac71-bbb281c78516',
                  'profession': 'doctor',
                  'specialty': null,
                  'departments': [
                    {
                      'id': '217b9408-0e39-4673-ae68-fea347a4d6a2',
                      'name': 'primary care',
                    },
                    {
                      'id': '32993943-690d-4c4c-9d86-c5a11c257a5e',
                      'name': 'reception',
                    },
                    {
                      'id': '56f91f28-d3b3-4ae7-9d24-03f04f1ecd9c',
                      'name': 'triage',
                    },
                  ],
                },
              ],
            },
          ],
        })
      },
    )
  })
})
