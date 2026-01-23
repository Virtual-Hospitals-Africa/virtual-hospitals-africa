import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { patient_encounters } from '../../../../../db/models/patient_encounters.ts'

import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
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
import { asWarningSigns, setupTriageNewPatient, setupTriageReturningPatient } from './_setup.ts'
import { patient_procedures } from '../../../../../db/models/patient_procedures.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../../../../shared/workflow.ts'
import assertIncludes from '../../../../../util/assertIncludes.ts'
import { MALIGNANT_NEOPLASTIC_DISEASE } from '../../../../../shared/snomed_concepts.ts'

describeParallel('triage/brief_history', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  describeParallel('GET', () => {
    itParallel(
      'renders the brief history page for a female patient',
      async () => {
        const { $ } = await setupTriageNewPatient({
          patient_demographics: randomDemographics('ZA', 'female'),
          warning_signs: asWarningSigns([], { pregnant: false }),
        })

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
          'covid19': {
            'existence': 'COVID-19',
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
        const { $ } = await setupTriageNewPatient({
          patient_demographics: randomDemographics('ZA', 'male'),
          warning_signs: asWarningSigns([], { pregnant: false }),
        })

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
          'covid19': {
            'existence': 'COVID-19',
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
        const { nurse, clinic, encounter, patient_id, patient_encounter_id } = await setupTriageNewPatient({
          patient_demographics: {},
          warning_signs: asWarningSigns([], { pregnant: false }),
          brief_history: {
            cancer: {
              existence: 'Yes',
            },
            diabetes: {
              existence: 'No',
            },
            pregnancy: {
              existence: 'No',
            },
          },
        })

        const other_nurse = await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
          organization_id: clinic.id,
        })

        const this_patient_findings = sortBy(
          await patient_findings.findAll(db, {
            patient_id,
            include_negative: true,
            procedure_id: patient_procedures.distinctIds(db, {
              patient_id,
              specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.brief_history.id,
            }),
          }),
          (finding) => finding.displays.full,
        )

        assertMatches(this_patient_findings, [
          {
            'id': z.string().uuid(),
            'created_at': z.date(),
            'patient_encounter_id': z.string().uuid(),
            'root_snomed_concept_id': '263490005',
            'root_snomed_concept_name': 'Status',
            'root_snomed_concept_category': 'attribute',
            'destination_relations': [],
            'source_relations': [],
            'evaluations': [],
            'attributes': [],
            'type': 'finding',
            'patient_encounter_employee_id': z.string().uuid(),
            'specific_snomed_concept_id': '73211009',
            'specific_snomed_concept_name': 'Diabetes mellitus',
            'specific_snomed_concept_category': 'disorder',
            'as_part_of_procedure': {
              'id': z.string().uuid(),
              'root_snomed_concept_id': '71388002',
              'root_snomed_concept_name': 'Procedure',
              'root_snomed_concept_category': 'procedure',
              'specific_snomed_concept_id': '203421005',
              'specific_snomed_concept_name': 'History taking, limited',
              'specific_snomed_concept_category': 'procedure',
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
            'id': z.string().uuid(),
            'created_at': z.date(),
            'patient_encounter_id': z.string().uuid(),
            'root_snomed_concept_id': '263490005',
            'root_snomed_concept_name': 'Status',
            'root_snomed_concept_category': 'attribute',
            'destination_relations': [],
            'source_relations': [],
            'evaluations': [],
            'attributes': [],
            'type': 'finding',
            'patient_encounter_employee_id': z.string().uuid(),
            'specific_snomed_concept_id': '363346000',
            'specific_snomed_concept_name': 'Malignant neoplastic disease',
            'specific_snomed_concept_category': 'disorder',
            'as_part_of_procedure': {
              'id': z.string().uuid(),
              'root_snomed_concept_id': '71388002',
              'root_snomed_concept_name': 'Procedure',
              'root_snomed_concept_category': 'procedure',
              'specific_snomed_concept_id': '203421005',
              'specific_snomed_concept_name': 'History taking, limited',
              'specific_snomed_concept_category': 'procedure',
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
            'id': z.string().uuid(),
            'created_at': z.date(),
            'patient_encounter_id': z.string().uuid(),
            'root_snomed_concept_id': '263490005',
            'root_snomed_concept_name': 'Status',
            'root_snomed_concept_category': 'attribute',
            'destination_relations': [],
            'source_relations': [],
            'evaluations': [],
            'attributes': [],
            'type': 'finding',
            'patient_encounter_employee_id': z.string().uuid(),
            'specific_snomed_concept_id': '77386006',
            'specific_snomed_concept_name': 'Pregnancy',
            'specific_snomed_concept_category': 'finding',
            'as_part_of_procedure': {
              'id': z.string().uuid(),
              'root_snomed_concept_id': '71388002',
              'root_snomed_concept_name': 'Procedure',
              'root_snomed_concept_category': 'procedure',
              'specific_snomed_concept_id': '203421005',
              'specific_snomed_concept_name': 'History taking, limited',
              'specific_snomed_concept_category': 'procedure',
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
            patient_id,
            encounter,
            health_worker_id: nurse.health_worker.id,
            conditions: COMMON_CONDITIONS,
          })

        assertMatches(most_recent_findings.cancer, {
          'type': 'finding',
          'id': z.string().uuid(),
          'created_at': z.date(),
          'patient_encounter_id': patient_encounter_id,
          'patient_encounter_employee_id': z.string().uuid(),
          'root_snomed_concept_id': '263490005',
          'root_snomed_concept_name': 'Status',
          'root_snomed_concept_category': 'attribute',
          'specific_snomed_concept_id': '363346000',
          'specific_snomed_concept_name': 'Malignant neoplastic disease',
          'specific_snomed_concept_category': 'disorder',
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
            'id': z.string().uuid(),
            'root_snomed_concept_id': '71388002',
            'root_snomed_concept_name': 'Procedure',
            'root_snomed_concept_category': 'procedure',
            'specific_snomed_concept_id': '203421005',
            'specific_snomed_concept_name': 'History taking, limited',
            'specific_snomed_concept_category': 'procedure',
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
          'id': z.string().uuid(),
          'created_at': z.date(),
          'patient_encounter_id': patient_encounter_id,
          'patient_encounter_employee_id': z.string().uuid(),
          'root_snomed_concept_id': '263490005',
          'root_snomed_concept_name': 'Status',
          'root_snomed_concept_category': 'attribute',
          'specific_snomed_concept_id': '73211009',
          'specific_snomed_concept_name': 'Diabetes mellitus',
          'value': {
            'type': 'snomed_concept',
            'snomed_concept_id': '373067005',
            'name': 'No',
          },

          'as_part_of_procedure': {
            'id': z.string().uuid(),
            'root_snomed_concept_id': '71388002',
            'root_snomed_concept_name': 'Procedure',
            'root_snomed_concept_category': 'procedure',
            'specific_snomed_concept_id': '203421005',
            'specific_snomed_concept_name': 'History taking, limited',
            'specific_snomed_concept_category': 'procedure',
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

        const $waiting_room_before_encounter_close = await other_nurse
          .fetchCheerio(
            `/app/organizations/${clinic.id}/waiting_room`,
          )

        const waiting_room_table_before_initial_encounter_close = getTableDisplay(
          $waiting_room_before_encounter_close,
        )

        assertMatches(waiting_room_table_before_initial_encounter_close, [
          {
            Patient: `${encounter.patient.name}${encounter.patient.sex} • ${
              prettyPatientDateOfBirth(
                encounter.patient.date_of_birth!,
              )
            }`,
            'Reason for visit': 'Seeking Treatment',
            // Department: 'Triage',
            // 'Target time': z.string().regex(/^\d{1,2}:\d{2} [AP]M( tomorrow)?/),
            Location: 'Triage room 1',
            Status: 'Triage In Progress',
            // Priority: 'Non-urgent',
            Employees: `${nurse.health_worker.name}Primary care nurse`,
            Arrived: z.enum(['Just now', '1 minute ago']),
            Actions: 'Triage',
          },
        ])

        await patient_encounters.close(db, { patient_encounter_id })

        const open_encounters = await patient_encounters.getOpen(db, { patient_id })

        assertArrayEmpty(open_encounters)

        const $waiting_room_after_initial_encounter_close = await other_nurse
          .fetchCheerio(
            `/app/organizations/${clinic.id}/waiting_room`,
          )

        assert(
          $waiting_room_after_initial_encounter_close.text().includes(
            'No patients present at the facility',
          ),
        )

        const returning = await setupTriageReturningPatient(
          {
            patient_id,
            nurse: other_nurse,
            clinic,
          },
        )

        assertNotEquals(
          encounter.patient_encounter_id,
          returning.patient_encounter_id,
        )

        assertLength(returning.encounter.all_employees_seen, 1)

        const $waiting_room_after_returning_start = await other_nurse
          .fetchCheerio(
            `/app/organizations/${clinic.id}/waiting_room`,
          )

        const waiting_room_table_after_returning_start = getTableDisplay($waiting_room_after_returning_start)

        assertMatches(waiting_room_table_after_returning_start, [
          {
            Patient: `${encounter.patient.name}${encounter.patient.sex} • ${
              prettyPatientDateOfBirth(
                encounter.patient.date_of_birth!,
              )
            }`,
            'Reason for visit': 'Seeking Treatment',
            // Department: 'Triage',
            Location: 'Triage room 1',
            Status: 'Triage In Progress',
            Employees: `${other_nurse.health_worker.name}Primary care nurse`,
            Arrived: z.enum(['Just now', '1 minute ago']),
            Actions: 'Triage',
          },
        ], { strict: true })

        const $brief_history_after_returning_encounter_start = await returning.postStep({
          warning_signs: asWarningSigns([], { pregnant: false }),
        })

        const form_values = getFormValues(
          $brief_history_after_returning_encounter_start,
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
            patient_id,
            patient_encounter_id,
            s_expression: `(active_condition ${MALIGNANT_NEOPLASTIC_DISEASE.s_expression})`,
          },
        )

        assert(findings_from_initial_encounter.satisfies)

        const findings_from_returning_encounter = await satisfyingSExpression(
          db,
          {
            patient_id,
            patient_encounter_id: returning.patient_encounter_id,
            s_expression: `(active_condition ${MALIGNANT_NEOPLASTIC_DISEASE.s_expression})`,
          },
        )

        assert(!findings_from_returning_encounter.satisfies)

        const most_recent_finding = getDOMTree(
          $brief_history_after_returning_encounter_start,
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
                  'text': 'Self reported Malignant neoplastic disease Status: Yes',
                },
                {
                  'tag': 'span',
                  'text': z.string().regex(/^recorded at \d{1,2}:\d{2}/),
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
                                  'text': 'Self reported Malignant neoplastic disease Status: Yes',
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
                                      'text': encounter.employee.name,
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
                                      'text': `at ${returning.encounter.organization.name}`,
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
                                            /^at \d{1,2}:\d{2}/,
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
        const { $, nurse, encounter, patient_id, triageRoute } = await setupTriageNewPatient({
          patient_demographics: randomDemographics('ZA', 'female'),
          warning_signs: asWarningSigns([], { pregnant: false }),
          brief_history: {
            diabetes: {
              existence: 'Yes',
            },
            pregnancy: {
              existence: 'No',
            },
          },
        })

        assertIncludes($.url, triageRoute('height_and_weight'))

        const most_recent_findings = await brief_history
          .renderedMostRecentFindings(db, {
            patient_id,
            encounter,
            health_worker_id: nurse.health_worker.id,
            conditions: COMMON_CONDITIONS,
          })

        assertMatches(most_recent_findings.diabetes, {
          'type': 'finding',
          'id': z.string().uuid(),
          'created_at': z.date(),
          'patient_encounter_id': encounter.patient_encounter_id,
          'patient_encounter_employee_id': z.string().uuid(),
          'root_snomed_concept_id': '263490005',
          'root_snomed_concept_name': 'Status',
          'root_snomed_concept_category': 'attribute',
          'specific_snomed_concept_id': '73211009',
          'specific_snomed_concept_name': 'Diabetes mellitus',
          'value': {
            'type': 'snomed_concept',
            'snomed_concept_id': '373066001',
            'name': 'Yes',
          },
          'destination_relations': [],
          'source_relations': [],
          'as_part_of_procedure': {
            'id': z.string().uuid(),
            'root_snomed_concept_id': '71388002',
            'root_snomed_concept_name': 'Procedure',
            'root_snomed_concept_category': 'procedure',
            'specific_snomed_concept_id': '203421005',
            'specific_snomed_concept_name': 'History taking, limited',
            'specific_snomed_concept_category': 'procedure',
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
            'id': nurse.health_worker.id,
            'employee_id': nurse.health_worker.employee_id,
          },
        })
      },
    )

    itParallel(
      'does not insert the same positive finding again if a condition is already known, but does insert negative records each time',
      async () => {
        const initial = await setupTriageNewPatient({
          patient_demographics: randomDemographics('ZA', 'female'),
          warning_signs: asWarningSigns([], { pregnant: false }),
          brief_history: {
            cancer: {
              existence: 'Yes',
            },
            diabetes: {
              existence: 'No',
            },
            pregnancy: {
              existence: 'No',
            },
          },
        })

        const other_nurse = await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
          organization_id: initial.clinic.id,
        })

        await patient_encounters.close(db, {
          patient_encounter_id: initial.patient_encounter_id,
        })

        const returning = await setupTriageReturningPatient({
          patient_id: initial.patient_id,
          clinic: initial.clinic,
          nurse: other_nurse,
          warning_signs: asWarningSigns([], { pregnant: false }),
          brief_history: {
            cancer: {
              existence: 'Yes',
            },
            diabetes: {
              existence: 'No',
            },
            pregnancy: {
              existence: 'No',
            },
          },
        })

        const most_recent_findings = await brief_history
          .renderedMostRecentFindings(db, {
            patient_id: initial.patient_id,
            encounter: returning.encounter,
            health_worker_id: other_nurse.health_worker.id,
            conditions: COMMON_CONDITIONS,
          })

        assertMatches(most_recent_findings.cancer, {
          'type': 'finding',
          'id': z.string().uuid(),
          'created_at': z.date(),
          'patient_encounter_id': initial.patient_encounter_id,
          'patient_encounter_employee_id': z.string().uuid(),
          'root_snomed_concept_id': '263490005',
          'root_snomed_concept_name': 'Status',
          'root_snomed_concept_category': 'attribute',
          'specific_snomed_concept_id': '363346000',
          'specific_snomed_concept_name': 'Malignant neoplastic disease',
          'specific_snomed_concept_category': 'disorder',
          'value': {
            'type': 'snomed_concept',
            'snomed_concept_id': '373066001',
            'name': 'Yes',
            'category': 'qualifier value',
          },
          'destination_relations': [],
          'source_relations': [],
          'as_part_of_procedure': {
            'id': z.string().uuid(),
            'specific_snomed_concept_id': '203421005',
            'specific_snomed_concept_name': 'History taking, limited',
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
            'id': initial.nurse.health_worker.id,
            'employee_id': initial.nurse.health_worker.employee_id,
          },
          'attributes': [],
        })

        assertMatches(most_recent_findings.diabetes, {
          'type': 'finding',
          'id': z.string().uuid(),
          'created_at': z.date(),
          'patient_encounter_id': returning.patient_encounter_id,
          'patient_encounter_employee_id': z.string().uuid(),
          'root_snomed_concept_id': '263490005',
          'root_snomed_concept_name': 'Status',
          'root_snomed_concept_category': 'attribute',
          'specific_snomed_concept_id': '73211009',
          'specific_snomed_concept_name': 'Diabetes mellitus',
          'specific_snomed_concept_category': 'disorder',
          'value': {
            'type': 'snomed_concept',
            'snomed_concept_id': '373067005',
            'name': 'No',
          },
          'existence': 'No',
          'as_part_of_procedure': {
            'id': z.string().uuid(),
            'specific_snomed_concept_id': '203421005',
            'specific_snomed_concept_name': 'History taking, limited',
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
            'id': other_nurse.health_worker.id,
            'employee_id': other_nurse.health_worker.employee_id,
          },
          'source_relations': [],
          'destination_relations': [],
        })
      },
    )

    itParallel(
      'has a full_display of Status Not Known for unknown answers',
      async () => {
        const { nurse, patient_id, patient_encounter_id, encounter } = await setupTriageNewPatient({
          patient_demographics: randomDemographics('ZA', 'female'),
          warning_signs: asWarningSigns([], { pregnant: false }),
          brief_history: {
            diabetes: {
              existence: 'No',
            },
            pregnancy: {
              existence: 'Unknown',
            },
          },
        })

        const most_recent_findings = await brief_history
          .renderedMostRecentFindings(db, {
            patient_id,
            encounter,
            health_worker_id: nurse.health_worker.id,
            conditions: COMMON_CONDITIONS,
          })

        assertMatches(most_recent_findings.pregnancy, {
          'type': 'finding',
          'id': z.string().uuid(),
          'created_at': z.date(),
          'patient_encounter_id': patient_encounter_id,
          'patient_encounter_employee_id': z.string().uuid(),
          'root_snomed_concept_id': '263490005',
          'root_snomed_concept_name': 'Status',
          'root_snomed_concept_category': 'attribute',
          'value': {
            'type': 'snomed_concept',
            'snomed_concept_id': '261665006',
            'name': 'Unknown',
          },
          'specific_snomed_concept_id': '77386006',
          'specific_snomed_concept_name': 'Pregnancy',
          'destination_relations': [],
          'source_relations': [],
          'as_part_of_procedure': {
            'id': z.string().uuid(),
            'root_snomed_concept_id': '71388002',
            'root_snomed_concept_name': 'Procedure',
            'root_snomed_concept_category': 'procedure',
            'specific_snomed_concept_id': '203421005',
            'specific_snomed_concept_name': 'History taking, limited',
            'specific_snomed_concept_category': 'procedure',
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
      'marks findings for the same condition as entered in error if part of this encounter, but then can override them in a returning encounter',
      async () => {
        const initial = await setupTriageNewPatient({
          patient_demographics: randomDemographics('ZA', 'female'),
          warning_signs: asWarningSigns([], { pregnant: false }),
          brief_history: {
            diabetes: {
              existence: 'No',
            },
            pregnancy: {
              existence: 'Yes',
            },
          },
        })

        const prior_to_fix_findings = await brief_history
          .renderedMostRecentFindings(db, {
            patient_id: initial.encounter.patient.id,
            encounter: initial.encounter,
            health_worker_id: initial.nurse.health_worker.id,
            conditions: COMMON_CONDITIONS,
          })

        assert(prior_to_fix_findings.pregnancy)

        assertArrayEmpty(
          await patient_evaluations.findAll(db, {
            patient_id: initial.encounter.patient.id,
            evaluates_record_id: prior_to_fix_findings.pregnancy.id,
          }),
        )

        await initial.postStep({
          brief_history: {
            diabetes: {
              existence: 'No',
            },
            pregnancy: {
              existence: 'No',
            },
          },
        })

        const entered_in_error = await patient_evaluations.findOne(db, {
          patient_id: initial.encounter.patient.id,
          evaluates_record_id: prior_to_fix_findings.pregnancy.id,
        })
        assertMatches(entered_in_error, {
          specific_snomed_concept_id: '723510000', // ENTERED_IN_ERROR
          evaluates_record_id: prior_to_fix_findings.pregnancy.id,
        })

        const initial_most_recent_findings = await brief_history
          .renderedMostRecentFindings(
            db,
            {
              patient_id: initial.encounter.patient.id,
              encounter: initial.encounter,
              health_worker_id: initial.nurse.health_worker.id,
              conditions: COMMON_CONDITIONS,
            },
          )

        assertMatches(initial_most_recent_findings.pregnancy, {
          'displays': {
            'value': 'No',
          },
        })

        await patient_encounters.close(db, {
          patient_encounter_id: initial.patient_encounter_id,
        })

        const returning = await setupTriageReturningPatient({
          nurse: initial.nurse,
          clinic: initial.clinic,
          patient_id: initial.patient_id,
        })

        await returning.postStep({
          brief_history: {
            diabetes: {
              existence: 'No',
            },
            pregnancy: {
              existence: 'Yes',
            },
          },
        })

        const returning_most_recent_findings = await brief_history
          .renderedMostRecentFindings(db, {
            patient_id: returning.patient_id,
            encounter: returning.encounter,
            health_worker_id: returning.nurse.health_worker.id,
            conditions: COMMON_CONDITIONS,
          })

        assertMatches(returning_most_recent_findings.pregnancy, {
          'displays': {
            'value': 'Yes',
          },
        })
      },
    )
  })
})
