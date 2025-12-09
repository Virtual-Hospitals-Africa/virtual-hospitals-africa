import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployee, addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import * as patient_encounters from '../../../../../db/models/patient_encounters.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest, insertReturningSeekingTreatmentWithEmployeeForTest } from '../../../../_helpers/workflows.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { createTestOrganization, TEST_ORGANIZATION_UUIDS } from '../../../../_helpers/organizations.ts'
import { positiveFindings } from '../../../../../db/models/brief_history.ts'
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

        // const form_display = getFormDisplay($)
        const form_values = getFormValues($)
        const form_display = getFormDisplay($)

        assertEquals(form_values, {})
        assertEquals(form_display, {
          "pregnancy": {
            "presence": "Pregnancy*"
          },
          "diabetes": {
            "presence": "Diabetes*"
          },
          "tuberculosis": {
            "presence": "Tuberculosis"
          },
          "hiv": {
            "presence": "Human Immunodeficiency Virus"
          },
          "asthma": {
            "presence": "Asthma"
          },
          "copd": {
            "presence": "Chronic Obstructive Pulmonary Disease"
          },
          "coronavirus": {
            "presence": "Coronavirus"
          },
          "heart_disease": {
            "presence": "Heart Disease"
          },
          "mental_disorder": {
            "presence": "Mental Disorder"
          },
          "epilepsy": {
            "presence": "Epilepsy"
          },
          "arthritis": {
            "presence": "Arthritis"
          },
          "cancer": {
            "presence": "Cancer"
          }
        }
      )
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
          "pregnancy": {
            "presence": "no"
          },
        })
        assertEquals(form_display, {
          "pregnancy": {
            "presence": "Pregnancy*"
          },
          "diabetes": {
            "presence": "Diabetes*"
          },
          "tuberculosis": {
            "presence": "Tuberculosis"
          },
          "hiv": {
            "presence": "Human Immunodeficiency Virus"
          },
          "asthma": {
            "presence": "Asthma"
          },
          "copd": {
            "presence": "Chronic Obstructive Pulmonary Disease"
          },
          "coronavirus": {
            "presence": "Coronavirus"
          },
          "heart_disease": {
            "presence": "Heart Disease"
          },
          "mental_disorder": {
            "presence": "Mental Disorder"
          },
          "epilepsy": {
            "presence": "Epilepsy"
          },
          "arthritis": {
            "presence": "Arthritis"
          },
          "cancer": {
            "presence": "Cancer"
          }
        }
      )
    })

    it('renders the brief history page for a patient with a pre-existing condition', async () => {
      const clinic = await createTestOrganization(db, { category: 'Clinic' })
      const nurse1 =
        await addTestEmployeeWithSession(db, {
          organization_id: clinic.id,
          profession: 'nurse',
          registration_status: 'approved',
        })

      const nurse2 =
        await addTestEmployeeWithSession(db, {
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
                presence: 'yes',
              },
              diabetes: {
                presence: 'no',
              },
              pregnancy: {
                presence: 'no',
              },
            }),
          },
          {
            cancel_response_body: true,
          },
        )

        const positive_findings = await positiveFindings(db, {
          patient_id: initial_encounter.patient.id,
        })
  
        assertEquals(positive_findings.length, 1)
        const [cancer_finding] = positive_findings
  
        assertEquals(cancer_finding, {
          'record_id': cancer_finding.record_id,
          created_at: cancer_finding.created_at,
          'snomed_concept_id': '363346000',
          'patient_encounter_id': initial_encounter.patient_encounter_id,
          'patient_encounter_employee_id':
          initial_encounter.employee.patient_encounter_employee_id,
          'name': 'Malignant neoplastic disease',
          'as_part_of_procedure': {
            'record_id': cancer_finding.as_part_of_procedure.record_id,
            'snomed_concept_id': '203421005',
            'name': 'History taking, limited',
          },
          'qualifiers': [],
          'pertaining_to_key': 'cancer',
        })

        const $waiting_room_before_initial_encounter_close = await nurse2.fetchCheerio(
          `/app/organizations/${clinic.id}/waiting_room`,
        )

        const waiting_room_table_before_initial_encounter_close = getTableDisplay($waiting_room_before_initial_encounter_close)
        assertEquals(waiting_room_table_before_initial_encounter_close, [
          {
            Patient: `${initial_encounter.patient.name}${initial_encounter.patient.sex} • ${prettyPatientDateOfBirth(initial_encounter.patient.date_of_birth!)}`,
            "Reason for visit": "Seeking Treatment",
            Department: "triage",
            Status: "Triage In Progress",
            Employees: `${nurse1.health_worker.name}primary care nurse`,
            Arrived: "Just now",
            Actions: "triage"
          }
        ])

        await patient_encounters.close(db, {
          patient_encounter_id: initial_encounter.patient_encounter_id,
        })

        const open_encounters = await patient_encounters.getOpen(db, {
          patient_id: initial_encounter.patient.id
        })

        assertArrayEmpty(open_encounters)

        const $waiting_room_after_initial_encounter_close = await nurse2.fetchCheerio(
          `/app/organizations/${clinic.id}/waiting_room`,
        )

        assert($waiting_room_after_initial_encounter_close.text().includes('No patients present at the facility'))

        const subsequent_encounter = await insertReturningSeekingTreatmentWithEmployeeForTest(
          db,
          nurse2.health_worker.organization_id,
          {
            patient_id: initial_encounter.patient.id,
            employment_id: nurse2.health_worker.employee_id,
          },
        )

        assertNotEquals(subsequent_encounter.patient_encounter_id, initial_encounter.patient_encounter_id)
        assertLength(subsequent_encounter.all_employees_seen, 1)

        const $waiting_room_after_subsequent_encounter_start = await nurse2.fetchCheerio(
          `/app/organizations/${clinic.id}/waiting_room`,
        )
        
        const waiting_room_table_after_subsequent_encounter_start = getTableDisplay($waiting_room_after_subsequent_encounter_start)
        assertEquals(waiting_room_table_after_subsequent_encounter_start, [
          {
            Patient: `${initial_encounter.patient.name}${initial_encounter.patient.sex} • ${prettyPatientDateOfBirth(initial_encounter.patient.date_of_birth!)}`,
            "Reason for visit": "Seeking Treatment",
            Department: "triage",
            Status: "Triage In Progress",
            Employees: `${nurse2.health_worker.name}primary care nurse`,
            Arrived: "Just now",
            Actions: "triage"
          }
        ])

        const $brief_history_after_subsequent_encounter_start = await nurse2.fetchCheerio(
          `/app/organizations/${clinic.id}/patients/${subsequent_encounter.patient.id}/open_encounter/triage/brief_history`,
        )

        console.log($brief_history_after_subsequent_encounter_start.html())

        const form_values = getFormValues($brief_history_after_subsequent_encounter_start)
        assertEquals(form_values, {
          "cancer": {
            "presence": "yes",
          },
          "pregnancy": {
            "presence": "no",
          },
        })

        const most_recent_finding = getDOMTree($brief_history_after_subsequent_encounter_start, '#most-recent-finding-cancer')
        assertMatches(most_recent_finding, {
          "tag": "span",
          "children": [
            {
              "tag": "a",
              "text": "Malignant neoplastic disease"
            },
            {
              "tag": "span",
              "text": z.string().regex(/^at \d{1,2}:\d{2} [AP]M$/)
            },
            {
              "tag": "div",
              "children": [
                {
                  "tag": "div",
                  "children": [
                    {
                      "tag": "div",
                      "children": [
                        {
                          "tag": "div",
                          "children": [
                            {
                              "tag": "div",
                              "children": [
                                {
                                  "tag": "h3",
                                  "text": "Malignant neoplastic disease"
                                }
                              ]
                            },
                            {
                              "tag": "div",
                              "children": [
                                {
                                  "tag": "button",
                                  "children": [
                                    {
                                      "tag": "svg",
                                      "children": [
                                        {
                                          "tag": "path"
                                        }
                                      ]
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        },
                        {
                          "tag": "div",
                          "children": [
                            {
                              "tag": "div",
                              "children": [
                                {
                                  "tag": "p",
                                  "text": "Recorded by:"
                                },
                                {
                                  "tag": "div",
                                  "children": [
                                    {
                                      "tag": "svg",
                                      "children": [
                                        {
                                          "tag": "path"
                                        }
                                      ]
                                    },
                                    {
                                      "tag": "p",
                                      "text": initial_encounter.employee.name
                                    }
                                  ]
                                },
                                {
                                  "tag": "div",
                                  "children": [
                                    {
                                      "tag": "div",
                                      "children": [
                                        {
                                          "tag": "svg",
                                          "children": [
                                            {
                                              "tag": "path"
                                            },
                                            {
                                              "tag": "path"
                                            }
                                          ]
                                        }
                                      ]
                                    },
                                    {
                                      "tag": "p",
                                      "text": "during History taking, limited"
                                    }
                                  ]
                                },
                                {
                                  "tag": "div",
                                  "children": [
                                    {
                                      "tag": "svg",
                                      "children": [
                                        {
                                          "tag": "path"
                                        }
                                      ]
                                    },
                                    {
                                      "tag": "p",
                                      "text": `at ${subsequent_encounter.organization.name}`
                                    }
                                  ]
                                },
                                {
                                  "tag": "div",
                                  "children": [
                                    {
                                      "tag": "svg",
                                      "children": [
                                        {
                                          "tag": "path"
                                        }
                                      ]
                                    },
                                    {
                                      "tag": "p",
                                      "children": [
                                        {
                                          "tag": "span",
                                          "text": z.string().regex(/^at \d{1,2}:\d{2} [AP]M$/)
                                        }
                                      ]
                                    }
                                  ]
                                },
                                {
                                  "tag": "a",
                                  "children": [
                                    {
                                      "tag": "span",
                                      "children": [
                                        {
                                          "tag": "svg",
                                          "children": [
                                            {
                                              "tag": "path"
                                            }
                                          ]
                                        }
                                      ]
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
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
              presence: 'yes',
            },
            pregnancy: {
              presence: 'no',
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

      const positive_findings = await positiveFindings(db, {
        patient_id: encounter.patient.id,
      })

      assertEquals(positive_findings.length, 1)
      const [diabetes_finding] = positive_findings

      assertEquals(diabetes_finding, {
        'record_id': diabetes_finding.record_id,
        created_at: diabetes_finding.created_at,
        'snomed_concept_id': '73211009',
        'patient_encounter_id': encounter.patient_encounter_id,
        'patient_encounter_employee_id':
          encounter.employee.patient_encounter_employee_id,
        'name': 'Diabetes mellitus',
        'as_part_of_procedure': {
          'record_id': diabetes_finding.as_part_of_procedure.record_id,
          'snomed_concept_id': '203421005',
          'name': 'History taking, limited',
        },
        'qualifiers': [],
        'pertaining_to_key': 'diabetes',
      })
    })

    it('does not insert the same findings again if already known', async () => {
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
              presence: 'yes',
            },
            pregnancy: {
              presence: 'no',
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

      const positive_findings = await positiveFindings(db, {
        patient_id: encounter.patient.id,
      })

      assertEquals(positive_findings.length, 1)
      const [diabetes_finding] = positive_findings

      assertEquals(diabetes_finding, {
        'record_id': diabetes_finding.record_id,
        created_at: diabetes_finding.created_at,
        'snomed_concept_id': '73211009',
        'patient_encounter_id': encounter.patient_encounter_id,
        'patient_encounter_employee_id':
          encounter.employee.patient_encounter_employee_id,
        'name': 'Diabetes mellitus',
        'as_part_of_procedure': {
          'record_id': diabetes_finding.as_part_of_procedure.record_id,
          'snomed_concept_id': '203421005',
          'name': 'History taking, limited',
        },
        'qualifiers': [],
        'pertaining_to_key': 'diabetes',
      })
    })
  })
})
