import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import * as patient_encounters from '../../../../../db/models/patient_encounters.ts'
import {
  insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest,
  insertReturningSeekingTreatmentWithEmployeeForTest,
} from '../../../../_helpers/workflows.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  createTestOrganization,
  TEST_ORGANIZATION_UUIDS,
} from '../../../../_helpers/organizations.ts'
import { route } from '../../../../route.ts'
import asFormData from '../../../../../util/asFormData.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { getFormDisplay, getFormValues } from '../../../../_helpers/form.ts'
import { getDOMTree } from '../../../../_helpers/dom.ts'
import { assert } from 'std/assert/assert.ts'
import { getTableDisplay } from '../../../../_helpers/table.ts'
import { prettyPatientDateOfBirth } from '../../../../../util/date.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import assertLength from '../../../../../util/assertLength.ts'
import { assertArrayEmpty } from '../../../../../util/arraySize.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import { z } from 'zod'
import { renderedMostRecentFindings } from '../../../../../db/models/brief_history.ts'

describe('triage/brief_history', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  describe('GET', () => {
    it('renders the brief history page for a female patient', async () => {
      const { health_worker: nurse, fetchCheerio } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
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

      const $ = await fetchCheerio(
        `/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
      )

      const form_values = getFormValues($)
      const form_display = getFormDisplay($)

      assertEquals(form_values, {})
      assertEquals(form_display, {
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
    })

    it('renders the brief history page for a male patient', async () => {
      const { health_worker: nurse, fetchCheerio } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
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

      const $ = await fetchCheerio(
        `/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
      )

      // const form_display = getFormDisplay($)
      const form_values = getFormValues($)
      const form_display = getFormDisplay($)

      assertEquals(form_values, {
        'pregnancy': {
          'existence': 'no',
        },
      })
      assertEquals(form_display, {
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
    })

    it('renders the brief history page for a patient with a pre-existing condition', async () => {
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
        `/app/organizations/${clinic.id}/patients/${initial_encounter.patient.id}/open_encounter/triage/brief_history`,
        {
          method: 'POST',
          body: asFormData({
            cancer: {
              existence: 'yes',
            },
            diabetes: {
              existence: 'no',
            },
            pregnancy: {
              existence: 'no',
            },
          }),
        },
        {
          cancel_response_body: true,
        },
      )

      const most_recent_findings = await renderedMostRecentFindings(db, {
        patient_id: initial_encounter.patient.id,
        encounter: initial_encounter,
        health_worker_id: nurse1.health_worker.id,
      })

      assertMatches(most_recent_findings.cancer, {
        'record_id': z.string().uuid(),
        created_at: z.date(),
        'snomed_concept_id': '363346000',
        'patient_encounter_id': initial_encounter.patient_encounter_id,
        'name': 'Malignant neoplastic disease',
        'as_part_of_procedure': {
          'record_id': z.string().uuid(),
          'snomed_concept_id': '203421005',
          'name': 'History taking, limited',
        },
        'qualifiers': [],
        'pertaining_to_key': 'cancer',
        'existence': 'yes',
      })

      assertMatches(most_recent_findings.diabetes, {
        'record_id': z.string().uuid(),
        'created_at': z.date(),
        'snomed_concept_id': '73211009',
        'patient_encounter_id': initial_encounter.patient_encounter_id,
        'name': 'Diabetes mellitus',
        'existence': 'no',
        'as_part_of_procedure': {
          'record_id': z.string().uuid(),
          'snomed_concept_id': '203421005',
          'name': 'History taking, limited',
        },
        'pertaining_to_key': 'diabetes',
        'value_display': 'No known Diabetes mellitus',
        'provider': {
          'is_me': true,
          'id': nurse1.health_worker.id,
          'employee_id': nurse1.health_worker.employee_id,
        },
        'qualifiers': [
          {
            'record_id': z.string().uuid(),
            'patient_encounter_id': initial_encounter.patient_encounter_id,
            'created_at': z.string().datetime({ offset: true }),
            'snomed_concept_id': '1381510001',
            'name': 'No known',
            'concrete_value': null,
            'value_display': 'No known',
            'provider': {
              'is_me': true,
              'id': nurse1.health_worker.id,
              'employee_id': nurse1.health_worker.employee_id,
            },
          },
        ],
      })

      assertEquals(most_recent_findings.copd, null)

      const $waiting_room_before_initial_encounter_close = await nurse2
        .fetchCheerio(
          `/app/organizations/${clinic.id}/waiting_room`,
        )

      const waiting_room_table_before_initial_encounter_close = getTableDisplay(
        $waiting_room_before_initial_encounter_close,
      )
      assertEquals(waiting_room_table_before_initial_encounter_close, [
        {
          Patient:
            `${initial_encounter.patient.name}${initial_encounter.patient.sex} • ${
              prettyPatientDateOfBirth(initial_encounter.patient.date_of_birth!)
            }`,
          'Reason for visit': 'Seeking Treatment',
          Department: 'triage',
          Status: 'Triage In Progress',
          Employees: `${nurse1.health_worker.name}primary care nurse`,
          Arrived: 'Just now',
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
      assertEquals(waiting_room_table_after_subsequent_encounter_start, [
        {
          Patient:
            `${initial_encounter.patient.name}${initial_encounter.patient.sex} • ${
              prettyPatientDateOfBirth(initial_encounter.patient.date_of_birth!)
            }`,
          'Reason for visit': 'Seeking Treatment',
          Department: 'triage',
          Status: 'Triage In Progress',
          Employees: `${nurse2.health_worker.name}primary care nurse`,
          Arrived: 'Just now',
          Actions: 'triage',
        },
      ])

      const $brief_history_after_subsequent_encounter_start = await nurse2
        .fetchCheerio(
          `/app/organizations/${clinic.id}/patients/${subsequent_encounter.patient.id}/open_encounter/triage/brief_history`,
        )

      const form_values = getFormValues(
        $brief_history_after_subsequent_encounter_start,
      )
      assertEquals(form_values, {
        'cancer': {
          'existence': 'yes',
        },
        'diabetes': {
          'existence': 'no',
        },
        'pregnancy': {
          'existence': 'no',
        },
      })

      const most_recent_finding = getDOMTree(
        $brief_history_after_subsequent_encounter_start,
        '#most-recent-finding-cancer',
      )
      assertMatches(most_recent_finding, {
        'tag': 'span',
        'children': [
          {
            'tag': 'a',
            'text': 'Malignant neoplastic disease',
          },
          {
            'tag': 'span',
            'text': z.string().regex(/^at \d{1,2}:\d{2} [AP]M$/),
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
                                'text': 'Malignant neoplastic disease',
                              },
                            ],
                          },
                          {
                            'tag': 'div',
                            'children': [
                              {
                                'tag': 'button',
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
                                          /^at \d{1,2}:\d{2} [AP]M$/,
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
    })
  })

  describe('POST', () => {
    it('inserts positive & negative findings, redirecting to the warning signs page', async () => {
      const { health_worker: nurse, fetchOk } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
        })

      const encounter =
        await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            employment_id: nurse.employee_id,
          },
        )

      const response = await fetchOk(
        `/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
        {
          method: 'POST',
          body: asFormData({
            diabetes: {
              existence: 'yes',
            },
            pregnancy: {
              existence: 'no',
            },
          }),
        },
        {
          cancel_response_body: true,
        },
      )

      assertEquals(
        response.url,
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
      )

      const most_recent_findings = await renderedMostRecentFindings(db, {
        patient_id: encounter.patient.id,
        encounter: encounter,
        health_worker_id: nurse.id,
      })

      assertMatches(most_recent_findings.diabetes, {
        'record_id': most_recent_findings.diabetes!.record_id,
        created_at: most_recent_findings.diabetes!.created_at,
        'snomed_concept_id': '73211009',
        'patient_encounter_id': encounter.patient_encounter_id,
        'name': 'Diabetes mellitus',
        'as_part_of_procedure': {
          'record_id':
            most_recent_findings.diabetes!.as_part_of_procedure.record_id,
          'snomed_concept_id': '203421005',
          'name': 'History taking, limited',
        },
        'qualifiers': [],
        'pertaining_to_key': 'diabetes',
        'existence': 'yes',
      })
    })

    it.only('does not insert the same positive finding again if a condition is already known, but does insert negative records each time', async () => {
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
        `/app/organizations/${clinic.id}/patients/${initial_encounter.patient.id}/open_encounter/triage/brief_history`,
        {
          method: 'POST',
          body: asFormData({
            cancer: {
              existence: 'yes',
            },
            diabetes: {
              existence: 'no',
            },
            pregnancy: {
              existence: 'no',
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
        `/app/organizations/${clinic.id}/patients/${subsequent_encounter.patient.id}/open_encounter/triage/brief_history`,
        {
          method: 'POST',
          body: asFormData({
            cancer: {
              existence: 'yes',
            },
            diabetes: {
              existence: 'no',
            },
            pregnancy: {
              existence: 'no',
            },
          }),
        },
        {
          cancel_response_body: true,
        },
      )

      const most_recent_findings = await renderedMostRecentFindings(db, {
        patient_id: subsequent_encounter.patient.id,
        encounter: subsequent_encounter,
        health_worker_id: nurse2.health_worker.id,
      })

      assertMatches(most_recent_findings.cancer, {
        'record_id': most_recent_findings.cancer!.record_id,
        created_at: most_recent_findings.cancer!.created_at,
        'snomed_concept_id': '363346000',
        'patient_encounter_id': initial_encounter.patient_encounter_id,
        'name': 'Malignant neoplastic disease',
        'as_part_of_procedure': {
          'record_id':
            most_recent_findings.cancer!.as_part_of_procedure.record_id,
          'snomed_concept_id': '203421005',
          'name': 'History taking, limited',
        },
        'qualifiers': [],
        'pertaining_to_key': 'cancer',
        'provider': {
          'is_me': false,
          'id': nurse1.health_worker.id,
          'employee_id': nurse1.health_worker.employee_id,
        },
      })

      assertMatches(most_recent_findings.diabetes, {
        'record_id': z.string().uuid(),
        'created_at': z.date(),
        'snomed_concept_id': '73211009',
        'patient_encounter_id': subsequent_encounter.patient_encounter_id,
        'name': 'Diabetes mellitus',
        'existence': 'no',
        'as_part_of_procedure': {
          'record_id': z.string().uuid(),
          'snomed_concept_id': '203421005',
          'name': 'History taking, limited',
        },
        'pertaining_to_key': 'diabetes',
        'value_display': 'No known Diabetes mellitus',
        'provider': {
          'is_me': true,
          'id': nurse2.health_worker.id,
          'employee_id': nurse2.health_worker.employee_id,
        },
      })
    })
  })
})
