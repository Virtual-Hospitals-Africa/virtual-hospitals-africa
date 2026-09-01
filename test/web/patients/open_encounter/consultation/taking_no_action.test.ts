import { afterAll, before } from 'std/testing/bdd.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { asVitalAssessmentFormValues, asVitalMeasurementFormValues, asWarningSignsAdult, setupTriageNewPatient } from '../triage/_setup.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { events } from '../../../../../db/models/events.ts'
import { getFormLabels, getFormOptions, getFormValues } from 'test/_helpers/form.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { patient_encounters } from '../../../../../db/models/patient_encounters.ts'
import { assert } from 'std/assert/assert.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import { addSessionForEmployee } from '../../../../_helpers/employees.ts'

describeParallel('consultation', () => {
  before(waitUntilTestServerUp)
  before(() => events.initializeAllProcessedPubSub())
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  itParallel(
    'can get through a consultation by just clicking POST on each form',
    async () => {
      const { $: $route_patient, patient_id, patient_encounter_id, shcp, clinic, postStep } = await setupTriageNewPatient({
        patient_demographics: randomDemographics('ZA', 'female', 'adult'),
        warning_signs: asWarningSignsAdult([], { pregnant: false }),
        brief_history: {
          common_conditions: {
            diabetes: { existence: 'No' },
            pregnancy: { existence: 'No' },
          },
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
          measurements: asVitalMeasurementFormValues({
            respiratory_rate: 12, // 9-14 -> score 0
            heart_rate: 60, // 51-100 -> score 0
            blood_pressure_systolic: 120,
            blood_pressure_diastolic: 80,
            temperature: 37.6,
          }),
          assessments: asVitalAssessmentFormValues({
            mobility_assessment: 'Walking',
            consciousness: 'Alert',
            trauma_presence: 'No',
          }),
        },
        additional_tasks_and_investigations: {},
        assign_priority: {},
      })

      await events.allProcessedForEncounter(db, { patient_encounter_id })

      const encounter = await patient_encounters.getById(db, patient_encounter_id)
      assertEquals(encounter.priority!.name, 'Non-urgent')

      const route_patient_form_values = getFormValues($route_patient)
      const _route_patient_form_labels = getFormLabels($route_patient)
      const _route_patient_form_options = getFormOptions($route_patient)

      assertMatches(route_patient_form_values, {
        'next_step': 'await_consultation' as const,
        'health_worker_ids_to_be_notified': [],
        'notes': null,
      }, { strict: true })

      const $await_consultation = await postStep({
        route_patient: route_patient_form_values,
      })

      assert(new URL($await_consultation.url).pathname.endsWith('/waiting_room'))
      assertEquals($await_consultation('[data-column="actions"] button').text(), 'Consultation')
      assertEquals($await_consultation('[data-column="actions"] button').attr('disabled'), 'disabled')

      const shcp_session = await addSessionForEmployee(db, shcp)

      const $waiting_room = await shcp_session.fetchCheerio($await_consultation.url)

      assertEquals($waiting_room('[data-column="actions"] button').text(), 'Start Consultation')
      assertEquals($waiting_room('[data-column="actions"] button').attr('disabled'), undefined)

      const start_consultation_action = $waiting_room('[data-column="actions"] form').attr('action')!
      assertEquals(start_consultation_action, `/app/organizations/${clinic.id}/patients/${patient_id}/open_encounter/start-workflow/consultation`)

      const $consultation_findings = await shcp_session.fetchCheerio(start_consultation_action, {
        method: 'POST',
      })
      assert(new URL($consultation_findings.url).pathname.endsWith('/findings'))

      const $consultation_diagnoses = await shcp_session.fetchCheerio($consultation_findings.url, {
        method: 'POST',
      })
      assert(new URL($consultation_diagnoses.url).pathname.endsWith('/diagnoses'))

      const $consultation_prescriptions = await shcp_session.fetchCheerio($consultation_diagnoses.url, {
        method: 'POST',
      })
      assert(new URL($consultation_prescriptions.url).pathname.endsWith('/prescriptions'))

      const $consultation_orders = await shcp_session.fetchCheerio($consultation_prescriptions.url, {
        method: 'POST',
      })
      assert(new URL($consultation_orders.url).pathname.endsWith('/orders'))

      const $consultation_clinical_notes = await shcp_session.fetchCheerio($consultation_orders.url, {
        method: 'POST',
      })
      assert(new URL($consultation_clinical_notes.url).pathname.endsWith('/clinical_notes'))

      const $consultation_request_review = await shcp_session.fetchCheerio($consultation_clinical_notes.url, {
        method: 'POST',
      })
      assert(new URL($consultation_request_review.url).pathname.endsWith('/request_review'))

      const $consultation_close_visit = await shcp_session.fetchCheerio($consultation_request_review.url, {
        method: 'POST',
      })
      assert(new URL($consultation_close_visit.url).pathname.endsWith('/close_visit'))
    },
  )
})
