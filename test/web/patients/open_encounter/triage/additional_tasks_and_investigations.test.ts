import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { setupTriage } from './_setup.ts'
import { route } from '../../../../_route.ts'
import { additional_tasks } from '../../../../../db/models/additional_tasks.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import { z } from 'zod'
import {
  asVitalAssessmentFormValues,
  asVitalMeasurementFormValues,
} from '../../../../../shared/vitals.ts'

describeParallel('triage/additional_tasks_and_investigations', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  itParallel.skip('loads on the page', async () => {
    const { $, clinic, encounter, nurse } = await setupTriage({
      patient_demographics: { date_of_birth: '2023-01-01' },
      conditions: ['diabetes'],
      warning_signs: [],
      height_and_weight: {
        height: {
          value: 160,
          units: 'cm',
        },
        weight: {
          value: 80,
          units: 'kg',
        },
      },
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

    const result = await additional_tasks.getTasksGroups(db, {
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
            'full_display':
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

              'destination_relations': [],
              'source_relations': [],
              'qualifiers': [],
              'type': 'procedure',
              'by_system': true,
              'employment_id': null,
              'full_display': 'Oxygen therapy',
            },
            'completed': false,
          },
        ],
      },
    ])
  })

  itParallel('prompts for Nausea Vomiting Pallor Sweating', async () => {
    const { $, clinic, encounter, nurse } = await setupTriage({
      patient_demographics: { date_of_birth: '2001-01-01' },
      conditions: [],
      warning_signs: ['Chest pain'],
      height_and_weight: {
        height: {
          value: 160,
          units: 'cm',
        },
        weight: {
          value: 80,
          units: 'kg',
        },
      },
      vitals: {
        measurements: asVitalMeasurementFormValues({
          respiratory_rate: 12, // 9-14 -> score 0
          heart_rate: 60, // 51-100 -> score 0
          blood_pressure_systolic: 120, // 101-199 -> score 0
          blood_pressure_diastolic: 80,
          temperature: 36.6, // 35-38.4 -> score 0
        }),
        assessments: asVitalAssessmentFormValues({
          mobility_assessment: 'Walking', // score 0
          consciousness: 'Alert', // score 0
          trauma_presence: 'No', // score 0
        }),
      },
    })

    assertEquals(
      $.url,
      `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/additional_tasks_and_investigations`,
    )

    const result = await additional_tasks.getTasksGroups(db, {
      encounter,
      health_worker_id: nurse.health_worker.id,
    })

    assertMatches(result, [
      {
        'due_to': [{ 'displays': { 'full': 'Chest pain' } }],
        'tasks': [
          {
            'procedure': {
              'value': {
                'type': 's_expression',
                's_expression':
                  '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Nausea" "finding"))',
              },
              'displays': {
                'value': 'Nausea',
              },
            },
          },
          {
            'procedure': {
              'value': {
                'type': 's_expression',
                's_expression': z.string(),
              },
              'displays': {
                'value': 'Vomiting',
              },
            },
          },
          {
            'procedure': {
              'value': {
                'type': 's_expression',
                's_expression': z.string(),
              },
              'displays': {
                'value': 'Pallor of skin of face',
              },
            },
          },
          {
            'procedure': {
              'value': {
                'type': 's_expression',
                's_expression': z.string(),
              },
              'displays': {
                'value': 'Sweating',
              },
            },
          },
        ],
      },
    ])
  })
})

// TODO: moving this
// describeParallel('POST', () => {
//   itParallel('creates an additional task if oxygen saturation is below 92%', async () => {
//     const { encounter } = await setupTriage({
//       patient_demographics: { date_of_birth: '2023-01-01' },
//       warning_signs: [],
//       conditions: ['diabetes'],
//       height_and_weight: {
//         height: {
//           value: 160,
//           units: 'cm',
//         },
//         weight: {
//           value: 80,
//           units: 'kg',
//         },
//       },
//       vitals: {
//         measurements: {
//           blood_oxygen_saturation: {
//             value: 91,
//             units: '%',
//           },
//         },
//         assessments: {},
//       },
//     })

//     const measurements = await patient_measurements.findAll(
//       db,
//       {
//         patient_id: encounter.patient.id,
//         s_expression: `
//           (and (not (measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.height}))
//                (not (measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.weight})))
//         `,
//       },
//     )

//     assertMatches(measurements, [
//       {
//         'type': 'finding',
//         'record_id': z.string().uuid(),
//         'created_at': z.date(),
//         'snomed_concept_id': '118245000',
//         'patient_encounter_id': z.string().uuid(),
//         'patient_encounter_employee_id': z.string().uuid(),
//         'name': 'Measurement finding',
//         'category': 'finding',
//         'destination_relations': [],
//         'value_snomed_concept_id': null,
//
//         'specific_snomed_concept_id': '103228002',
//         'finding_name': 'Hemoglobin saturation with oxygen',
//         'value_display': '91%',
//         'source_relations': [
//           {
//             'source_id': z.string().uuid(),
//             'snomed_concept_id': '42752001',
//           },
//         ],
//         'as_part_of_procedure': {
//           'record_id': z.string().uuid(),
//           'snomed_concept_id': '410188000',
//           'name': 'Taking patient vital signs assessment',
//         },
//         'priority': null,
//         'qualifiers': [],
//         'value': '91',
//         'units': '%',
//         'full_display': 'Hemoglobin saturation with oxygen: 91%',
//       },
//     ], { strict: true })

//     const evaluations = await patient_evaluations.findAll(
//       db,
//       {
//         patient_id: encounter.patient.id,
//       },
//     )

//     const action_status = findMatching(evaluations, {
//       name: 'Action status',
//     })

//     assertMatches(action_status, {
//       'type': 'evaluation',
//       'record_id': z.string().uuid(),
//       'created_at': z.date(),
//       'snomed_concept_id': '385641008',
//       'patient_encounter_id': z.string().uuid(),
//       'evaluates_record_id': z.string().uuid(),
//       'employment_id': null,
//       'by_system': true,
//       'name': 'Action status',
//       'category': 'attribute',
//       'value_snomed_concept_id': '385643006',
//       'value_name': 'To be done',
//       'qualifiers': [],
//       'source_relations': [],
//       'destination_relations': [{
//         'destination_id': z.string().uuid(),
//         'snomed_concept_id': '42752001',
//       }],
//     }, { strict: true })

//     const planned_procedure = await patient_procedures.getById(
//       db,
//       action_status.evaluates_record_id,
//     )

//     assertMatches(planned_procedure, {
//       'record_id': z.string().uuid(),
//       'created_at': z.date(),
//       'snomed_concept_id': '57485005',
//       'patient_encounter_id': z.string().uuid(),
//       'name': 'Oxygen therapy',
//       'value_snomed_concept_id': null,
//
//       'qualifiers': [],
//       'source_relations': [],
//       'destination_relations': [],
//       'full_display': 'Oxygen therapy',
//       'value_display': 'Oxygen therapy',
//       'category': 'procedure',
//       'type': 'procedure',
//       'by_system': true,
//       'employment_id': null,
//     }, { strict: true })
//   })
