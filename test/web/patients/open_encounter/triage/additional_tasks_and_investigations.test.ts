import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { asWarningSigns, setupTriageNewPatient } from './_setup.ts'
import { route } from '../../../../_route.ts'
import { additional_tasks } from '../../../../../db/models/additional_tasks.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import { z } from 'zod'
import { asVitalAssessmentFormValues, asVitalMeasurementFormValues } from '../../../../../shared/vitals.ts'

import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { assert } from 'std/assert/assert.ts'
import { patient_evaluations } from '../../../../../db/models/patient_evaluations.ts'
import { DIAGNOSIS } from '../../../../../shared/snomed_concepts.ts'
import { events } from '../../../../../db/models/events.ts'
import { system_diagnosis_rules } from '../../../../../db/models/system_diagnosis_rules.ts'
import { patient_findings } from '../../../../../db/models/patient_findings.ts'

describeParallel('triage/additional_tasks_and_investigations', () => {
  before(waitUntilTestServerUp)
  before(async () => {
    await events.initializeAllProcessedPubSub()
  })
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  itParallel.skip('loads on the page', async () => {
    const { $, clinic, encounter, nurse } = await setupTriageNewPatient({
      patient_demographics: { date_of_birth: '2023-01-01' },
      brief_history: {
        diabetes: { existence: 'Yes' },
        pregnancy: { existence: 'No' },
      },
      warning_signs: {
        warning_signs: {},
      },
      height_and_weight: {
        measurements: {
          height: {
            value: 160,
            units: 'cm',
          },
          weight: {
            value: 80,
            units: 'kg',
          },
        },
      },
      measure_vitals: {
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
            'id': z.string().uuid(),
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
                'id': z.string().uuid(),
                'snomed_concept_id': '103228002',
                'category': 'observable entity',
                'name': 'Hemoglobin saturation with oxygen',

                'qualifiers': [],
              },
            ],
            'type': 'finding',
            'patient_encounter_employee_id': z.string().uuid(),
            'as_part_of_procedure': {
              'id': z.string().uuid(),
              'snomed_concept_id': '410188000',
              'name': 'Taking patient vital signs assessment',
            },
            'priority': null,
            'full_display': 'Hemoglobin saturation with oxygen Measurement finding',
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
                  'formatted_address': '123 Test St, Test City, South Africa, 12345',
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
              'id': z.string().uuid(),
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

  itParallel('prompts for Nausea Vomiting Pallor Sweating in case of chest pain', async () => {
    const { $, clinic, encounter, nurse } = await setupTriageNewPatient({
      patient_demographics: { date_of_birth: '2001-01-01' },
      brief_history: {
        diabetes: { existence: 'No' },
        pregnancy: { existence: 'No' },
      },
      warning_signs: asWarningSigns(['Chest pain'], { pregnant: false }),
      height_and_weight: {
        measurements: {
          height: {
            value: 160,
            units: 'cm',
          },
          weight: {
            value: 80,
            units: 'kg',
          },
        },
      },
      measure_vitals: {
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
                'type': 'link',
                'title': 'Chest pain page',
                'href': '/medical-resources/primary-care/adult.pdf#page=37',
                'thumbnail_href': '/medical-resources/za/primary-care/adult/thumbnails/150/37.png',
              },
              'displays': {
                'finding': 'Reference documentation',
                'value': {
                  'title': 'Chest pain page',
                  'href': '/medical-resources/primary-care/adult.pdf#page=37',
                  'thumbnail_href': '/medical-resources/za/primary-care/adult/thumbnails/150/37.png',
                },
              },
            },
          },
          {
            'procedure': {
              'specific_snomed_concept_id': '409060008',
              'specific_snomed_concept_name': 'Evaluation for signs and symptoms of physical health problems',
              'value': {
                'type': 's_expression',
                's_expression': z.string(),
                'nodes': [
                  {
                    'atom': 'finding',
                    'displays': {
                      'finding': 'Nausea',
                    },
                  },
                  {
                    'atom': 'finding',
                    'displays': {
                      'finding': 'Vomiting',
                    },
                  },
                  {
                    'atom': 'finding',
                    'displays': {
                      'finding': 'Pallor of skin of face',
                    },
                  },
                  {
                    'atom': 'finding',
                    'displays': {
                      'finding': 'Sweating',
                    },
                  },
                ],
              },
              'displays': {
                'value': 'Nausea; Vomiting; Pallor of skin of face; Sweating',
              },
            },
          },
        ],
      },
    ])
  })

  itParallel(
    'does not give a probable diagnosis for anaphylaxis if exposed to fish without an allergy',
    async () => {
      const exposure_to_fish_s_expr = '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))'

      const { patient_id, patient_encounter_id } = await setupTriageNewPatient({
        patient_demographics: randomDemographics('ZA', 'female', 'adult'),
        warning_signs: asWarningSigns([], { pregnant: false }, exposure_to_fish_s_expr),
        brief_history: {
          diabetes: {
            existence: 'No',
          },
          pregnancy: {
            existence: 'No',
          },
        },
      })

      await events.allProcessedForEncounter(db, { patient_encounter_id })

      const anaphylaxis_diagnosis = await patient_evaluations.findOneOptional(
        db,
        {
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: DIAGNOSIS.id,
        },
      )

      assert(!anaphylaxis_diagnosis)
    },
  )

  itParallel(
    'does give a probable diagnosis for anaphylaxis if exposed to fish with an allergy',
    async () => {
      const exposure_to_fish_s_expr = '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))'
      const allergy_to_fish_s_expr = '(allergy (snomed_concept "Fish" "substance"))'

      const { patient_id, patient_encounter_id } = await setupTriageNewPatient({
        patient_demographics: randomDemographics('ZA', 'female', 'adult'),
        warning_signs: asWarningSigns([], { pregnant: false }, exposure_to_fish_s_expr, allergy_to_fish_s_expr),
        brief_history: {
          diabetes: {
            existence: 'No',
          },
          pregnancy: {
            existence: 'No',
          },
        },
      })

      const allergy_to_fish = await patient_findings.findOne(db, {
        patient_id,
        s_expression: allergy_to_fish_s_expr,
      })

      await events.allProcessedForEncounter(db, { patient_encounter_id })

      await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
        patient_id,
        patient_encounter_id,
        patient_age_determination: 'adult',
        findings: [{
          id: allergy_to_fish.id,
          existence: 'Yes',
        }],
      })

      const anaphylaxis_diagnosis = await patient_evaluations.findOne(
        db,
        {
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: DIAGNOSIS.id,
        },
      )

      assertMatches(anaphylaxis_diagnosis, {
        displays: {
          full: 'Anaphylaxis Diagnosis: Probable diagnosis',
        },
      })

      // Running again has no effect
      await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
        patient_id,
        patient_encounter_id,
        patient_age_determination: 'adult',
        findings: [{
          id: allergy_to_fish.id,
          existence: 'Yes',
        }],
      })

      const same_anaphylaxis_diagnosis = await patient_evaluations.findOne(
        db,
        {
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: DIAGNOSIS.id,
        },
      )

      assertEquals(anaphylaxis_diagnosis, same_anaphylaxis_diagnosis)
    },
  )

  itParallel(
    'does give a possible diagnosis for anaphylaxis for an insect bite',
    async () => {
      const insect_bite_s_expr = '(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))'
      const { patient_id, patient_encounter_id } = await setupTriageNewPatient({
        patient_demographics: randomDemographics('ZA', 'female', 'adult'),
        warning_signs: asWarningSigns([], { pregnant: false }, insect_bite_s_expr),
        brief_history: {
          diabetes: {
            existence: 'No',
          },
          pregnancy: {
            existence: 'No',
          },
        },
      })

      await events.allProcessedForEncounter(db, { patient_encounter_id })

      const anaphylaxis_diagnosis = await patient_evaluations.findOne(
        db,
        {
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: DIAGNOSIS.id,
        },
      )

      assertMatches(anaphylaxis_diagnosis, {
        displays: {
          full: 'Anaphylaxis Diagnosis: Possible diagnosis',
        },
      })

      const insect_bite = await patient_findings.findOne(db, {
        patient_id,
        s_expression: insect_bite_s_expr,
      })

      // Running again has no effect
      await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
        patient_id,
        patient_encounter_id,
        patient_age_determination: 'adult',
        findings: [{
          id: insect_bite.id,
          existence: 'Yes',
        }],
      })

      const same_anaphylaxis_diagnosis = await patient_evaluations.findOne(
        db,
        {
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: DIAGNOSIS.id,
        },
      )

      assertEquals(anaphylaxis_diagnosis, same_anaphylaxis_diagnosis)
    },
  )
})

// TODO: moving this
// describeParallel('POST', () => {
//   itParallel('creates an additional task if oxygen saturation is below 92%', async () => {
//     const { encounter } = await setupTriageNewPatient({
//       patient_demographics: { date_of_birth: '2023-01-01' },
//       warning_signs: [],
//       conditions: ['diabetes'],
//       height_and_weight: {
// measurements: {
//         height: {
//           value: 160,
//           units: 'cm',
//         },
//         weight: {
//           value: 80,
//           units: 'kg',
//         },}
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
//         'id': z.string().uuid(),
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
//           'id': z.string().uuid(),
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
//       'id': z.string().uuid(),
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
//       'id': z.string().uuid(),
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
