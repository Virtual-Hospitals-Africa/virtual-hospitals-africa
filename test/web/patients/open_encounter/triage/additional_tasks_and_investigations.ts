import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { setupTriage } from './_setup.ts'
import { route } from '../../../../route.ts'
import { getTasksGroups } from '../../../../../db/models/additional_tasks.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import { z } from 'zod'

describe('triage/additional_tasks_and_investigations', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  it('loads on the page', async () => {
    const { $, clinic, encounter, nurse } = await setupTriage({
      patient_demographics: { date_of_birth: '2023-01-01' },
      conditions: ['diabetes'],
      warning_signs: [],
      vitals: {
        measurements: {
          blood_oxygen_saturation: {
            value: 91,
            units: '%',
          },
        },
        assessments: {},
      },
    })

    assertEquals(
      $.url,
      `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/additional_tasks_and_investigations`,
    )

    const result = await getTasksGroups(db, {
      encounter,
      health_worker_id: nurse.health_worker.id,
    })

    assertMatches(result, [
      {
        'due_to': [
          {
            'record_id': z.string().uuid(),
            'created_at': z.date(),
            'snomed_concept_id': '118245000',
            'patient_encounter_id': z.string().uuid(),
            'name': 'Measurement finding',
            'category': 'finding',
            'value_snomed_concept_id': null,
            'value_name': null,
            'destination_relations': [],
            'source_relations': [
              {
                'source_id': z.string().uuid(),
                'snomed_concept_id': '42752001',
              },
            ],
            'qualifiers': [
              {
                'record_id': z.string().uuid(),
                'snomed_concept_id': '103228002',
                'category': 'observable entity',
                'name': 'Hemoglobin saturation with oxygen',
                'value_name': null,
                'qualifiers': [],
              },
            ],
            'type': 'finding',
            'patient_encounter_employee_id': z.string().uuid(),
            'as_part_of_procedure': {
              'record_id': z.string().uuid(),
              'snomed_concept_id': '410188000',
              'name': 'Taking patient vital signs assessment',
            },
            'priority': null,
            'value_display':
              'Hemoglobin saturation with oxygen Measurement finding',
            'provider': {
              'is_me': true,
              'id': z.string().uuid(),
              'name': z.string(),
              'first_names': 'Test Health Worker',
              'surname': z.string().uuid(),
              'preferred_name': 'Test',
              'email': z.string().email(),
              'avatar_url': z.string(),
              'organizations': [
                {
                  'id': z.string().uuid(),
                  'name': z.string(),
                  'category': 'Clinic',
                  'is_test': false,
                  'country': 'ZA',
                  'ownership': null,
                  'inactive_reason': null,
                  'most_common_language_code': null,
                  'formatted_address':
                    '123 Test St, Test City, South Africa, 12345',
                  'description': '123 Test St, Test City, South Africa, 12345',
                  'waiting_room_id': z.string().uuid(),
                  'reception_id': z.string().uuid(),
                  'location': {
                    'longitude': 0,
                    'latitude': 0,
                  },
                  'departments': [
                    {
                      'id': z.string().uuid(),
                      'name': 'Primary care',
                      'requires_triage': true,
                      'workflows': [
                        'consultation',
                      ],
                    },
                    {
                      'id': z.string().uuid(),
                      'name': 'Maternity',
                      'requires_triage': true,
                      'workflows': [
                        'maternity',
                      ],
                    },
                    {
                      'id': z.string().uuid(),
                      'name': 'Immunizations',
                      'requires_triage': true,
                      'workflows': [],
                    },
                    {
                      'id': z.string().uuid(),
                      'name': 'Chronic diseases',
                      'requires_triage': true,
                      'workflows': [],
                    },
                    {
                      'id': z.string().uuid(),
                      'name': 'Reception',
                      'requires_triage': false,
                      'workflows': [
                        'registration',
                      ],
                    },
                    {
                      'id': z.string().uuid(),
                      'name': 'Waiting room',
                      'requires_triage': false,
                      'workflows': [],
                    },
                    {
                      'id': z.string().uuid(),
                      'name': 'Triage',
                      'requires_triage': false,
                      'workflows': [
                        'triage',
                      ],
                    },
                    {
                      'id': z.string().uuid(),
                      'name': 'Administration',
                      'requires_triage': false,
                      'workflows': [],
                    },
                    {
                      'id': z.string().uuid(),
                      'name': 'Pharmacy',
                      'requires_triage': false,
                      'workflows': [
                        'prescription_refill',
                      ],
                    },
                    {
                      'id': z.string().uuid(),
                      'name': 'Emergency',
                      'requires_triage': false,
                      'workflows': [
                        'stabilization',
                      ],
                    },
                  ],
                  'employment_id': z.string().uuid(),
                  'profession': 'nurse',
                  'specialty': 'Primary care',
                  'is_admin': false,
                  'department_ids': z.array(z.string().uuid()),
                },
              ],
              'employee_id': z.string().uuid(),
              'organization_id': z.string().uuid(),
              'profession': 'nurse',
              'specialty': 'Primary care',
              'is_admin': false,
              'href': z.string(),
              'patient_encounter_employee_id': z.string().uuid(),
              'seen_at': z.string(),
            },
          },
        ],
        'tasks': [
          {
            'task': {
              'record_id': z.string().uuid(),
              'created_at': z.date(),
              'snomed_concept_id': '57485005',
              'patient_encounter_id': z.string().uuid(),
              'name': 'Oxygen therapy',
              'category': 'procedure',
              'value_snomed_concept_id': null,
              'value_name': null,
              'destination_relations': [],
              'source_relations': [],
              'qualifiers': [],
              'type': 'procedure',
              'by_system': true,
              'employment_id': null,
              'value_display': 'Oxygen therapy',
            },
            'completed': false,
          },
        ],
      },
    ])
  })
})
