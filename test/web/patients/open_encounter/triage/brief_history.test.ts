import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { patient_encounters } from '../../../../../db/models/patient_encounters.ts'
import {
  insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest,
  insertReturningSeekingTreatmentWithEmployeeForTest,
} from '../../../../_helpers/workflows.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { createTestOrganization } from '../../../../_helpers/organizations.ts'
import { route } from '../../../../_route.ts'
import asFormData from '../../../../../util/asFormData.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { getFormLabels, getFormValues } from '../../../../_helpers/form.ts'
import { getDOMTree } from '../../../../_helpers/dom.ts'
import { assert } from 'std/assert/assert.ts'
import { getTableDisplay } from '../../../../_helpers/table.ts'
import { prettyPatientDateOfBirth } from '../../../../../util/date.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import assertLength from '../../../../../util/assertLength.ts'
import { assertArrayEmpty } from '../../../../../util/arraySize.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import { z } from 'zod'
import { brief_history } from '../../../../../db/models/brief_history.ts'
import { patient_findings } from '../../../../../db/models/patient_findings.ts'
import { satisfyingSExpression } from '../../../../../db/models/s_expression.ts'
import { COMMON_CONDITIONS } from '../../../../../shared/brief_history.ts'
import { patient_evaluations } from '../../../../../db/models/patient_evaluations.ts'
import sortBy from '../../../../../util/sortBy.ts'

describeParallel('triage/brief_history', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  describeParallel('GET', () => {
    itParallel(
      'renders the brief history page for a female patient',
      async () => {
        const clinic = await createTestOrganization(db)
        const { health_worker: nurse, fetchOk, fetchCheerio } =
          await addTestEmployeeWithSession(db, {
            profession: 'nurse',
            registration_status: 'approved',
            organization_id: clinic.id,
          })

        const encounter =
          await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.organization_id,
            {
              patient_demographics: randomDemographics('ZA', 'female'),
              employment_id: nurse.employee_id,
            },
          )

        await fetchOk(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
          { method: 'POST' },
          { cancel_response_body: true },
        )

        const $ = await fetchCheerio(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
        )

        const form_values = getFormValues($)
        const form_labels = getFormLabels($)

        assertEquals(form_values, {})
        assertEquals(form_labels, {
          'pregnancy': {
            'existence': 'Pregnancy*',
          },
          'diabetes': {
            'existence': 'Diabetes*',
          },
          'tuberculosis': {
            'existence': 'Tuberculosis',
          },
          'hiv': {
            'existence': 'Human Immunodeficiency Virus',
          },
          'asthma': {
            'existence': 'Asthma',
          },
          'copd': {
            'existence': 'Chronic Obstructive Pulmonary Disease',
          },
          'coronavirus': {
            'existence': 'Coronavirus',
          },
          'heart_disease': {
            'existence': 'Heart Disease',
          },
          'mental_disorder': {
            'existence': 'Mental Disorder',
          },
          'epilepsy': {
            'existence': 'Epilepsy',
          },
          'arthritis': {
            'existence': 'Arthritis',
          },
          'cancer': {
            'existence': 'Cancer',
          },
        })
      },
    )

    itParallel(
      'renders the brief history page for a male patient',
      async () => {
        const clinic = await createTestOrganization(db)
        const { health_worker: nurse, fetchOk, fetchCheerio } =
          await addTestEmployeeWithSession(db, {
            profession: 'nurse',
            registration_status: 'approved',
            organization_id: clinic.id,
          })

        const encounter =
          await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.organization_id,
            {
              patient_demographics: randomDemographics('ZA', 'male'),
              employment_id: nurse.employee_id,
            },
          )

        await fetchOk(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
          {
            method: 'POST',
          },
          { cancel_response_body: true },
        )
        const $ = await fetchCheerio(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
        )

        // const form_labels = getFormLabels($)
        const form_values = getFormValues($)
        const form_labels = getFormLabels($)

        assertEquals(form_values, {
          'pregnancy': {
            'existence': 'No',
          },
        })
        assertEquals(form_labels, {
          'pregnancy': {
            'existence': 'Pregnancy*',
          },
          'diabetes': {
            'existence': 'Diabetes*',
          },
          'tuberculosis': {
            'existence': 'Tuberculosis',
          },
          'hiv': {
            'existence': 'Human Immunodeficiency Virus',
          },
          'asthma': {
            'existence': 'Asthma',
          },
          'copd': {
            'existence': 'Chronic Obstructive Pulmonary Disease',
          },
          'coronavirus': {
            'existence': 'Coronavirus',
          },
          'heart_disease': {
            'existence': 'Heart Disease',
          },
          'mental_disorder': {
            'existence': 'Mental Disorder',
          },
          'epilepsy': {
            'existence': 'Epilepsy',
          },
          'arthritis': {
            'existence': 'Arthritis',
          },
          'cancer': {
            'existence': 'Cancer',
          },
        })
      },
    )

    itParallel(
      'renders the brief history page for a patient with a pre-existing condition',
      async () => {
        const clinic = await createTestOrganization(db, { category: 'Clinic' })
        const nurse1 = await addTestEmployeeWithSession(db, {
          organization_id: clinic.id,
          profession: 'nurse',
          registration_status: 'approved',
        })

        const nurse2 = await addTestEmployeeWithSession(db, {
          organization_id: clinic.id,
          profession: 'nurse',
          registration_status: 'approved',
        })

        const initial_encounter =
          await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse1.health_worker.organization_id,
            {
              patient_demographics: randomDemographics('ZA', 'male'),
              employment_id: nurse1.health_worker.employee_id,
            },
          )

        await nurse1.fetchOk(
          `/app/organizations/${clinic.id}/patients/${initial_encounter.patient.id}/open_encounter/triage/warning_signs`,
          { method: 'POST' },
          { cancel_response_body: true },
        )

        await nurse1.fetchOk(
          `/app/organizations/${clinic.id}/patients/${initial_encounter.patient.id}/open_encounter/triage/brief_history`,
          {
            method: 'POST',
            body: asFormData({
              cancer: {
                existence: 'Yes',
              },
              diabetes: {
                existence: 'No',
              },
              pregnancy: {
                existence: 'No',
              },
            }),
          },
          {
            cancel_response_body: true,
          },
        )

        const this_patient_findings = sortBy(
          await patient_findings.findAll(db, {
            patient_id: initial_encounter.patient.id,
          }),
          (finding) => finding.displays.full,
        )

        assertMatches(this_patient_findings, [
          {
            'record_id': z.string().uuid(),
            'created_at': z.date(),
            'patient_encounter_id': z.string().uuid(),
            'root_snomed_concept': {
              'snomed_concept_id': '263490005',
              'name': 'Status',
              'category': 'attribute',
            },
            'destination_relations': [],
            'source_relations': [],
            'evaluations': [],
            'attributes': [],
            'type': 'finding',
            'patient_encounter_employee_id': z.string().uuid(),
            'specific_snomed_concept': {
              'snomed_concept_id': '73211009',
              'name': 'Diabetes mellitus',
              'category': 'disorder',
            },
            'as_part_of_procedure': {
              'record_id': z.string().uuid(),
              'root_snomed_concept': {
                'snomed_concept_id': '71388002',
                'name': 'Procedure',
                'category': 'procedure',
              },
              'specific_snomed_concept': {
                'snomed_concept_id': '203421005',
                'name': 'History taking, limited',
                'category': 'procedure',
              },
            },
            'priority': null,
            'score': null,
            'value': {
              'type': 'snomed_concept',
              'snomed_concept_id': '373067005',
              'name': 'No',
              'category': 'qualifier value',
            },
            'displays': {
              'value': 'No',
              'finding': 'Self reported Diabetes mellitus Status',
              'full': 'Self reported Diabetes mellitus Status: No',
            },
          },
          {
            'record_id': z.string().uuid(),
            'created_at': z.date(),
            'patient_encounter_id': z.string().uuid(),
            'root_snomed_concept': {
              'snomed_concept_id': '263490005',
              'name': 'Status',
              'category': 'attribute',
            },
            'destination_relations': [],
            'source_relations': [],
            'evaluations': [],
            'attributes': [],
            'type': 'finding',
            'patient_encounter_employee_id': z.string().uuid(),
            'specific_snomed_concept': {
              'snomed_concept_id': '363346000',
              'name': 'Malignant neoplastic disease',
              'category': 'disorder',
            },
            'as_part_of_procedure': {
              'record_id': z.string().uuid(),
              'root_snomed_concept': {
                'snomed_concept_id': '71388002',
                'name': 'Procedure',
                'category': 'procedure',
              },
              'specific_snomed_concept': {
                'snomed_concept_id': '203421005',
                'name': 'History taking, limited',
                'category': 'procedure',
              },
            },
            'priority': null,
            'score': null,
            'value': {
              'type': 'snomed_concept',
              'snomed_concept_id': '373066001',
              'name': 'Yes',
              'category': 'qualifier value',
            },
            'displays': {
              'value': 'Yes',
              'finding': 'Self reported Malignant neoplastic disease Status',
              'full': 'Self reported Malignant neoplastic disease Status: Yes',
            },
          },
          {
            'record_id': z.string().uuid(),
            'created_at': z.date(),
            'patient_encounter_id': z.string().uuid(),
            'root_snomed_concept': {
              'snomed_concept_id': '263490005',
              'name': 'Status',
              'category': 'attribute',
            },
            'destination_relations': [],
            'source_relations': [],
            'evaluations': [],
            'attributes': [],
            'type': 'finding',
            'patient_encounter_employee_id': z.string().uuid(),
            'specific_snomed_concept': {
              'snomed_concept_id': '77386006',
              'name': 'Pregnancy',
              'category': 'finding',
            },
            'as_part_of_procedure': {
              'record_id': z.string().uuid(),
              'root_snomed_concept': {
                'snomed_concept_id': '71388002',
                'name': 'Procedure',
                'category': 'procedure',
              },
              'specific_snomed_concept': {
                'snomed_concept_id': '203421005',
                'name': 'History taking, limited',
                'category': 'procedure',
              },
            },
            'priority': null,
            'score': null,
            'value': {
              'type': 'snomed_concept',
              'snomed_concept_id': '373067005',
              'name': 'No',
              'category': 'qualifier value',
            },
            'displays': {
              'value': 'No',
              'finding': 'Self reported Pregnancy Status',
              'full': 'Self reported Pregnancy Status: No',
            },
          },
        ])

        const most_recent_findings = await brief_history
          .renderedMostRecentFindings(db, {
            patient_id: initial_encounter.patient.id,
            encounter: initial_encounter,
            health_worker_id: nurse1.health_worker.id,
            conditions: COMMON_CONDITIONS,
          })

        assertMatches(most_recent_findings.cancer, {
          'type': 'finding',
          'record_id': z.string().uuid(),
          'created_at': z.date(),
          'patient_encounter_id': initial_encounter.patient_encounter_id,
          'patient_encounter_employee_id': z.string().uuid(),
          'root_snomed_concept': {
            'snomed_concept_id': '263490005',
            'name': 'Status',
            'category': 'attribute',
          },
          'specific_snomed_concept': {
            'snomed_concept_id': '363346000',
            'name': 'Malignant neoplastic disease',
            'category': 'disorder',
          },
          'value': {
            'type': 'snomed_concept',
            'snomed_concept_id': '373066001',
            'name': 'Yes',
          },
          'displays': {
            'finding': 'Self reported Malignant neoplastic disease Status',
            'full': 'Self reported Malignant neoplastic disease Status: Yes',
            'value': 'Yes',
          },

          'as_part_of_procedure': {
            'record_id': z.string().uuid(),
            'root_snomed_concept': {
              'snomed_concept_id': '71388002',
              'name': 'Procedure',
              'category': 'procedure',
            },
            'specific_snomed_concept': {
              'snomed_concept_id': '203421005',
              'name': 'History taking, limited',
              'category': 'procedure',
            },
          },
          'priority': null,
          'score': null,
          'pertaining_to_key': 'cancer',

          'existence': 'Yes',
          'provider': {
            'is_me': true,
            'profession': 'nurse',
            'specialty': 'Primary care',
            'is_admin': false,
            'seen_at': z.string().datetime({ offset: true }),
          },
          'attributes': [],

          'source_relations': [],
          'destination_relations': [],
        })

        assertMatches(most_recent_findings.diabetes, {
          'type': 'finding',
          'record_id': z.string().uuid(),
          'created_at': z.date(),
          'patient_encounter_id': initial_encounter.patient_encounter_id,
          'patient_encounter_employee_id': z.string().uuid(),
          'root_snomed_concept': {
            'snomed_concept_id': '263490005',
            'name': 'Status',
            'category': 'attribute',
          },
          'specific_snomed_concept': {
            'snomed_concept_id': '73211009',
            'name': 'Diabetes mellitus',
          },
          'value': {
            'type': 'snomed_concept',
            'snomed_concept_id': '373067005',
            'name': 'No',
          },

          'as_part_of_procedure': {
            'record_id': z.string().uuid(),
            'root_snomed_concept': {
              'snomed_concept_id': '71388002',
              'name': 'Procedure',
              'category': 'procedure',
            },
            'specific_snomed_concept': {
              'snomed_concept_id': '203421005',
              'name': 'History taking, limited',
              'category': 'procedure',
            },
          },
          'priority': null,
          'score': null,
          'pertaining_to_key': 'diabetes',
          'displays': {
            'finding': 'Self reported Diabetes mellitus Status',
            'full': 'Self reported Diabetes mellitus Status: No',
            'value': 'No',
          },

          'existence': 'No',
          'provider': {
            'is_me': true,
            'profession': 'nurse',
            'specialty': 'Primary care',
            'is_admin': false,
            'seen_at': z.string().datetime({ offset: true }),
          },
          'attributes': [],
          'source_relations': [],
          'destination_relations': [],
        })

        assertEquals(most_recent_findings.copd, undefined)

        const $waiting_room_before_initial_encounter_close = await nurse2
          .fetchCheerio(
            `/app/organizations/${clinic.id}/waiting_room`,
          )

        const waiting_room_table_before_initial_encounter_close =
          getTableDisplay(
            $waiting_room_before_initial_encounter_close,
          )

        assertMatches(waiting_room_table_before_initial_encounter_close, [
          {
            Patient:
              `${initial_encounter.patient.name}${initial_encounter.patient.sex} • ${
                prettyPatientDateOfBirth(
                  initial_encounter.patient.date_of_birth!,
                )
              }`,
            'Reason for visit': 'Seeking Treatment',
            // Department: 'Triage',
            // 'Target time': z.string().regex(/^\d{1,2}:\d{2} [AP]M( tomorrow)?/),
            Location: 'Triage room 1',
            Status: 'Triage In Progress',
            // Priority: 'Non-urgent',
            Employees: `${nurse1.health_worker.name}Primary care nurse`,
            Arrived: z.enum(['Just now', '1 minute ago']),
            Actions: 'triage',
          },
        ])

        await patient_encounters.close(db, {
          patient_encounter_id: initial_encounter.patient_encounter_id,
        })

        const open_encounters = await patient_encounters.getOpen(db, {
          patient_id: initial_encounter.patient.id,
        })

        assertArrayEmpty(open_encounters)

        const $waiting_room_after_initial_encounter_close = await nurse2
          .fetchCheerio(
            `/app/organizations/${clinic.id}/waiting_room`,
          )

        assert(
          $waiting_room_after_initial_encounter_close.text().includes(
            'No patients present at the facility',
          ),
        )

        const subsequent_encounter =
          await insertReturningSeekingTreatmentWithEmployeeForTest(
            db,
            nurse2.health_worker.organization_id,
            {
              patient_id: initial_encounter.patient.id,
              employment_id: nurse2.health_worker.employee_id,
            },
          )

        assertNotEquals(
          subsequent_encounter.patient_encounter_id,
          initial_encounter.patient_encounter_id,
        )

        assertLength(subsequent_encounter.all_employees_seen, 1)

        const $waiting_room_after_subsequent_encounter_start = await nurse2
          .fetchCheerio(
            `/app/organizations/${clinic.id}/waiting_room`,
          )

        const waiting_room_table_after_subsequent_encounter_start =
          getTableDisplay($waiting_room_after_subsequent_encounter_start)

        assertMatches(waiting_room_table_after_subsequent_encounter_start, [
          {
            Patient:
              `${initial_encounter.patient.name}${initial_encounter.patient.sex} • ${
                prettyPatientDateOfBirth(
                  initial_encounter.patient.date_of_birth!,
                )
              }`,
            'Reason for visit': 'Seeking Treatment',
            // Department: 'Triage',
            Location: 'Triage room 1',
            Status: 'Triage In Progress',
            Employees: `${nurse2.health_worker.name}Primary care nurse`,
            Arrived: z.enum(['Just now', '1 minute ago']),
            Actions: 'triage',
          },
        ], { strict: true })

        await nurse2.fetchOk(
          `/app/organizations/${clinic.id}/patients/${subsequent_encounter.patient.id}/open_encounter/triage/warning_signs`,
          { method: 'POST' },
          { cancel_response_body: true },
        )

        const $brief_history_after_subsequent_encounter_start = await nurse2
          .fetchCheerio(
            `/app/organizations/${clinic.id}/patients/${subsequent_encounter.patient.id}/open_encounter/triage/brief_history`,
          )

        const form_values = getFormValues(
          $brief_history_after_subsequent_encounter_start,
        )
        assertEquals(form_values, {
          'cancer': {
            'existence': 'Yes',
          },
          'diabetes': {
            'existence': 'No',
          },
          'pregnancy': {
            'existence': 'No',
          },
        })

        const findings_from_initial_encounter = await satisfyingSExpression(
          db,
          {
            patient_id: initial_encounter.patient.id,
            patient_encounter_id: initial_encounter.patient_encounter_id,
            s_expression: '(active_condition 363346000)',
          },
        )

        assert(findings_from_initial_encounter.satisfies)

        const findings_from_subsequent_encounter = await satisfyingSExpression(
          db,
          {
            patient_id: initial_encounter.patient.id,
            patient_encounter_id: subsequent_encounter.patient_encounter_id,
            s_expression: '(active_condition 363346000)',
          },
        )

        assert(!findings_from_subsequent_encounter.satisfies)

        const most_recent_finding = getDOMTree(
          $brief_history_after_subsequent_encounter_start,
          '#most-recent-finding-cancer',
        )

        assertMatches(most_recent_finding, {
          'tag': 'span',
          'children': [
            {
              'tag': 'span',
              'children': [
                {
                  'tag': 'a',
                  'text':
                    'Self reported Malignant neoplastic disease Status: Yes',
                },
                {
                  'tag': 'span',
                  'text': z.string().regex(/^at \d{1,2}:\d{2}/),
                },
              ],
            },
            {
              'tag': 'div',
              'children': [
                {
                  'tag': 'div',
                  'children': [
                    {
                      'tag': 'div',
                      'children': [
                        {
                          'tag': 'div',
                          'children': [
                            {
                              'tag': 'div',
                              'children': [
                                {
                                  'tag': 'h3',
                                  'text':
                                    'Self reported Malignant neoplastic disease Status: Yes',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          'tag': 'div',
                          'children': [
                            {
                              'tag': 'div',
                              'children': [
                                {
                                  'tag': 'p',
                                  'text': 'Recorded by:',
                                },
                                {
                                  'tag': 'div',
                                  'children': [
                                    {
                                      'tag': 'svg',
                                      'children': [
                                        {
                                          'tag': 'path',
                                        },
                                      ],
                                    },
                                    {
                                      'tag': 'p',
                                      'text': initial_encounter.employee.name,
                                    },
                                  ],
                                },
                                {
                                  'tag': 'div',
                                  'children': [
                                    {
                                      'tag': 'div',
                                      'children': [
                                        {
                                          'tag': 'svg',
                                          'children': [
                                            {
                                              'tag': 'path',
                                            },
                                            {
                                              'tag': 'path',
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                    {
                                      'tag': 'p',
                                      'text': 'during History taking, limited',
                                    },
                                  ],
                                },
                                {
                                  'tag': 'div',
                                  'children': [
                                    {
                                      'tag': 'svg',
                                      'children': [
                                        {
                                          'tag': 'path',
                                        },
                                      ],
                                    },
                                    {
                                      'tag': 'p',
                                      'text':
                                        `at ${subsequent_encounter.organization.name}`,
                                    },
                                  ],
                                },
                                {
                                  'tag': 'div',
                                  'children': [
                                    {
                                      'tag': 'svg',
                                      'children': [
                                        {
                                          'tag': 'path',
                                        },
                                      ],
                                    },
                                    {
                                      'tag': 'p',
                                      'children': [
                                        {
                                          'tag': 'span',
                                          'text': z.string().regex(
                                            /^at \d{1,2}:\d{2}/,
                                          ),
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  'tag': 'a',
                                  'children': [
                                    {
                                      'tag': 'span',
                                      'children': [
                                        {
                                          'tag': 'svg',
                                          'children': [
                                            {
                                              'tag': 'path',
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
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

  describeParallel('POST', () => {
    itParallel(
      'inserts positive & negative findings, redirecting to the measure_vitals page',
      async () => {
        const clinic = await createTestOrganization(db)
        const { health_worker: nurse, fetchOk } =
          await addTestEmployeeWithSession(db, {
            profession: 'nurse',
            registration_status: 'approved',
            organization_id: clinic.id,
          })

        const encounter =
          await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.organization_id,
            {
              employment_id: nurse.employee_id,
            },
          )

        await fetchOk(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
          { method: 'POST' },
          { cancel_response_body: true },
        )

        const response = await fetchOk(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
          {
            method: 'POST',
            body: asFormData({
              diabetes: {
                existence: 'Yes',
              },
              pregnancy: {
                existence: 'No',
              },
            }),
          },
          {
            cancel_response_body: true,
          },
        )

        assertEquals(
          response.url,
          `${route}/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/height_and_weight`,
        )

        const most_recent_findings = await brief_history
          .renderedMostRecentFindings(db, {
            patient_id: encounter.patient.id,
            encounter: encounter,
            health_worker_id: nurse.id,
            conditions: COMMON_CONDITIONS,
          })

        assertMatches(most_recent_findings.diabetes, {
          'type': 'finding',
          'record_id': z.string().uuid(),
          'created_at': z.date(),
          'patient_encounter_id': encounter.patient_encounter_id,
          'patient_encounter_employee_id': z.string().uuid(),
          'root_snomed_concept': {
            'snomed_concept_id': '263490005',
            'name': 'Status',
            'category': 'attribute',
          },
          'specific_snomed_concept': {
            'snomed_concept_id': '73211009',
            'name': 'Diabetes mellitus',
          },
          'value': {
            'type': 'snomed_concept',
            'snomed_concept_id': '373066001',
            'name': 'Yes',
          },
          'destination_relations': [],
          'source_relations': [],
          'as_part_of_procedure': {
            'record_id': z.string().uuid(),
            'root_snomed_concept': {
              'snomed_concept_id': '71388002',
              'name': 'Procedure',
              'category': 'procedure',
            },
            'specific_snomed_concept': {
              'snomed_concept_id': '203421005',
              'name': 'History taking, limited',
              'category': 'procedure',
            },
          },
          'priority': null,
          'score': null,
          'attributes': [],

          'pertaining_to_key': 'diabetes',
          'displays': {
            'finding': 'Self reported Diabetes mellitus Status',
            'full': 'Self reported Diabetes mellitus Status: Yes',
            'value': 'Yes',
          },
          'existence': 'Yes',
          'provider': {
            'is_me': true,
            'id': nurse.id,
            'employee_id': nurse.employee_id,
          },
        })
      },
    )

    itParallel(
      'does not insert the same positive finding again if a condition is already known, but does insert negative records each time',
      async () => {
        const clinic = await createTestOrganization(db, { category: 'Clinic' })
        const nurse1 = await addTestEmployeeWithSession(db, {
          organization_id: clinic.id,
          profession: 'nurse',
          registration_status: 'approved',
        })

        const nurse2 = await addTestEmployeeWithSession(db, {
          organization_id: clinic.id,
          profession: 'nurse',
          registration_status: 'approved',
        })

        const initial_encounter =
          await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse1.health_worker.organization_id,
            {
              patient_demographics: randomDemographics('ZA', 'male'),
              employment_id: nurse1.health_worker.employee_id,
            },
          )

        await nurse1.fetchOk(
          `/app/organizations/${clinic.id}/patients/${initial_encounter.patient.id}/open_encounter/triage/warning_signs`,
          { method: 'POST' },
          { cancel_response_body: true },
        )

        await nurse1.fetchOk(
          `/app/organizations/${clinic.id}/patients/${initial_encounter.patient.id}/open_encounter/triage/brief_history`,
          {
            method: 'POST',
            body: asFormData({
              cancer: {
                existence: 'Yes',
              },
              diabetes: {
                existence: 'No',
              },
              pregnancy: {
                existence: 'No',
              },
            }),
          },
          {
            cancel_response_body: true,
          },
        )

        await patient_encounters.close(db, {
          patient_encounter_id: initial_encounter.patient_encounter_id,
        })

        const subsequent_encounter =
          await insertReturningSeekingTreatmentWithEmployeeForTest(
            db,
            nurse2.health_worker.organization_id,
            {
              patient_id: initial_encounter.patient.id,
              employment_id: nurse2.health_worker.employee_id,
            },
          )

        await nurse2.fetchOk(
          `/app/organizations/${clinic.id}/patients/${subsequent_encounter.patient.id}/open_encounter/triage/warning_signs`,
          { method: 'POST' },
          { cancel_response_body: true },
        )

        await nurse2.fetchOk(
          `/app/organizations/${clinic.id}/patients/${subsequent_encounter.patient.id}/open_encounter/triage/brief_history`,
          {
            method: 'POST',
            body: asFormData({
              cancer: {
                existence: 'Yes',
              },
              diabetes: {
                existence: 'No',
              },
              pregnancy: {
                existence: 'No',
              },
            }),
          },
          {
            cancel_response_body: true,
          },
        )

        const most_recent_findings = await brief_history
          .renderedMostRecentFindings(db, {
            patient_id: subsequent_encounter.patient.id,
            encounter: subsequent_encounter,
            health_worker_id: nurse2.health_worker.id,
            conditions: COMMON_CONDITIONS,
          })

        assertMatches(most_recent_findings.cancer, {
          'type': 'finding',
          'record_id': z.string().uuid(),
          'created_at': z.date(),
          'patient_encounter_id': initial_encounter.patient_encounter_id,
          'patient_encounter_employee_id': z.string().uuid(),
          'root_snomed_concept': {
            'snomed_concept_id': '263490005',
            'name': 'Status',
            'category': 'attribute',
          },
          'specific_snomed_concept': {
            'snomed_concept_id': '363346000',
            'name': 'Malignant neoplastic disease',
            'category': 'disorder',
          },
          'value': {
            'type': 'snomed_concept',
            'snomed_concept_id': '373066001',
            'name': 'Yes',
            'category': 'qualifier value',
          },
          'destination_relations': [],
          'source_relations': [],
          'as_part_of_procedure': {
            'record_id': z.string().uuid(),
            'specific_snomed_concept': {
              'snomed_concept_id': '203421005',
              'name': 'History taking, limited',
            },
          },
          'priority': null,
          'score': null,
          'pertaining_to_key': 'cancer',
          'displays': {
            'finding': 'Self reported Malignant neoplastic disease Status',
            'full': 'Self reported Malignant neoplastic disease Status: Yes',
            'value': 'Yes',
          },
          'existence': 'Yes',
          'provider': {
            'is_me': false,
            'id': nurse1.health_worker.id,
            'employee_id': nurse1.health_worker.employee_id,
          },
          'attributes': [],
        })

        assertMatches(most_recent_findings.diabetes, {
          'type': 'finding',
          'record_id': z.string().uuid(),
          'created_at': z.date(),
          'patient_encounter_id': subsequent_encounter.patient_encounter_id,
          'patient_encounter_employee_id': z.string().uuid(),
          'root_snomed_concept': {
            'snomed_concept_id': '263490005',
            'name': 'Status',
            'category': 'attribute',
          },
          'specific_snomed_concept': {
            'snomed_concept_id': '73211009',
            'name': 'Diabetes mellitus',
            'category': 'disorder',
          },
          'value': {
            'type': 'snomed_concept',
            'snomed_concept_id': '373067005',
            'name': 'No',
          },
          'existence': 'No',
          'as_part_of_procedure': {
            'record_id': z.string().uuid(),
            'specific_snomed_concept': {
              'snomed_concept_id': '203421005',
              'name': 'History taking, limited',
            },
          },
          'priority': null,
          'score': null,
          'pertaining_to_key': 'diabetes',
          'displays': {
            'finding': 'Self reported Diabetes mellitus Status',
            'full': 'Self reported Diabetes mellitus Status: No',
            'value': 'No',
          },
          'attributes': [],
          'provider': {
            'is_me': true,
            'id': nurse2.health_worker.id,
            'employee_id': nurse2.health_worker.employee_id,
          },
          'source_relations': [],
          'destination_relations': [],
        })
      },
    )

    itParallel(
      'has a full_display of Status Not Known for unknown answers',
      async () => {
        const clinic = await createTestOrganization(db, { category: 'Clinic' })
        const nurse = await addTestEmployeeWithSession(db, {
          organization_id: clinic.id,
          profession: 'nurse',
          registration_status: 'approved',
        })

        const encounter =
          await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.health_worker.organization_id,
            {
              patient_demographics: randomDemographics('ZA', 'male'),
              employment_id: nurse.health_worker.employee_id,
            },
          )

        await nurse.fetchOk(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
          { method: 'POST' },
          { cancel_response_body: true },
        )

        await nurse.fetchOk(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
          {
            method: 'POST',
            body: asFormData({
              diabetes: {
                existence: 'No',
              },
              pregnancy: {
                existence: 'Unknown',
              },
            }),
          },
          {
            cancel_response_body: true,
          },
        )

        const most_recent_findings = await brief_history
          .renderedMostRecentFindings(db, {
            patient_id: encounter.patient.id,
            encounter: encounter,
            health_worker_id: nurse.health_worker.id,
            conditions: COMMON_CONDITIONS,
          })

        assertMatches(most_recent_findings.pregnancy, {
          'type': 'finding',
          'record_id': z.string().uuid(),
          'created_at': z.date(),
          'patient_encounter_id': encounter.patient_encounter_id,
          'patient_encounter_employee_id': z.string().uuid(),
          'root_snomed_concept': {
            'snomed_concept_id': '263490005',
            'name': 'Status',
            'category': 'attribute',
          },
          'value': {
            'type': 'snomed_concept',
            'snomed_concept_id': '261665006',
            'name': 'Unknown',
          },
          'specific_snomed_concept': {
            'snomed_concept_id': '77386006',
            'name': 'Pregnancy',
          },
          'destination_relations': [],
          'source_relations': [],
          'as_part_of_procedure': {
            'record_id': z.string().uuid(),
            'root_snomed_concept': {
              'snomed_concept_id': '71388002',
              'name': 'Procedure',
              'category': 'procedure',
            },
            'specific_snomed_concept': {
              'snomed_concept_id': '203421005',
              'name': 'History taking, limited',
              'category': 'procedure',
            },
          },
          'priority': null,
          'score': null,
          'displays': {
            'finding': 'Self reported Pregnancy Status',
            'full': 'Self reported Pregnancy Status: Unknown',
            'value': 'Unknown',
          },
          'existence': 'Unknown',
          'attributes': [],
          'pertaining_to_key': 'pregnancy',
          'provider': {
            'is_me': true,
            'id': nurse.health_worker.id,
            'employee_id': nurse.health_worker.employee_id,
          },
        })
      },
    )

    itParallel(
      'marks findings for the same condition as entered in error if part of this encounter, but then can override them in a subsequent encounter',
      async () => {
        const clinic = await createTestOrganization(db, { category: 'Clinic' })
        const nurse = await addTestEmployeeWithSession(db, {
          organization_id: clinic.id,
          profession: 'nurse',
          registration_status: 'approved',
        })

        const initial_encounter =
          await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.health_worker.organization_id,
            {
              patient_demographics: randomDemographics('ZA', 'male'),
              employment_id: nurse.health_worker.employee_id,
            },
          )

        await nurse.fetchOk(
          `/app/organizations/${clinic.id}/patients/${initial_encounter.patient.id}/open_encounter/triage/warning_signs`,
          { method: 'POST' },
          { cancel_response_body: true },
        )

        await nurse.fetchOk(
          `/app/organizations/${clinic.id}/patients/${initial_encounter.patient.id}/open_encounter/triage/brief_history`,
          {
            method: 'POST',
            body: asFormData({
              diabetes: {
                existence: 'No',
              },
              pregnancy: {
                existence: 'Yes',
              },
            }),
          },
          {
            cancel_response_body: true,
          },
        )

        const prior_to_fix_findings = await brief_history
          .renderedMostRecentFindings(db, {
            patient_id: initial_encounter.patient.id,
            encounter: initial_encounter,
            health_worker_id: nurse.health_worker.id,
            conditions: COMMON_CONDITIONS,
          })

        assert(prior_to_fix_findings.pregnancy)

        assertArrayEmpty(
          await patient_evaluations.findAll(db, {
            patient_id: initial_encounter.patient.id,
            evaluates_record_id: prior_to_fix_findings.pregnancy.record_id,
          }),
        )

        await nurse.fetchOk(
          `/app/organizations/${clinic.id}/patients/${initial_encounter.patient.id}/open_encounter/triage/brief_history`,
          {
            method: 'POST',
            body: asFormData({
              diabetes: {
                existence: 'No',
              },
              pregnancy: {
                existence: 'No',
              },
            }),
          },
          {
            cancel_response_body: true,
          },
        )

        const entered_in_error = await patient_evaluations.findOne(db, {
          patient_id: initial_encounter.patient.id,
          evaluates_record_id: prior_to_fix_findings.pregnancy.record_id,
        })
        assertMatches(entered_in_error, {
          specific_snomed_concept: {
            snomed_concept_id: '723510000', // ENTERED_IN_ERROR
          },
          evaluates_record_id: prior_to_fix_findings.pregnancy.record_id,
        })

        const initial_most_recent_findings = await brief_history
          .renderedMostRecentFindings(
            db,
            {
              patient_id: initial_encounter.patient.id,
              encounter: initial_encounter,
              health_worker_id: nurse.health_worker.id,
              conditions: COMMON_CONDITIONS,
            },
          )

        assertMatches(initial_most_recent_findings.pregnancy, {
          'displays': {
            'value': 'No',
          },
        })

        await patient_encounters.close(db, {
          patient_encounter_id: initial_encounter.patient_encounter_id,
        })

        const subsequent_encounter =
          await insertReturningSeekingTreatmentWithEmployeeForTest(
            db,
            nurse.health_worker.organization_id,
            {
              patient_id: initial_encounter.patient.id,
              employment_id: nurse.health_worker.employee_id,
            },
          )

        await nurse.fetchOk(
          `/app/organizations/${clinic.id}/patients/${subsequent_encounter.patient.id}/open_encounter/triage/brief_history`,
          {
            method: 'POST',
            body: asFormData({
              diabetes: {
                existence: 'No',
              },
              pregnancy: {
                existence: 'Yes',
              },
            }),
          },
          {
            cancel_response_body: true,
          },
        )

        const subsequent_most_recent_findings = await brief_history
          .renderedMostRecentFindings(db, {
            patient_id: subsequent_encounter.patient.id,
            encounter: subsequent_encounter,
            health_worker_id: nurse.health_worker.id,
            conditions: COMMON_CONDITIONS,
          })

        assertMatches(subsequent_most_recent_findings.pregnancy, {
          'displays': {
            'value': 'Yes',
          },
        })
      },
    )
  })
})
