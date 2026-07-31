import { afterAll, before } from 'std/testing/bdd.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { asVitalAssessmentFormValues, asVitalMeasurementFormValues, asWarningSignsAdult, setupTriageNewPatient } from './_setup.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { events } from '../../../../../db/models/events.ts'
import { getFormLabels, getFormOptions, getFormValues } from 'test/_helpers/form.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { patient_encounters } from '../../../../../db/models/patient_encounters.ts'
import { assert } from 'std/assert/assert.ts'

import { patient_triage } from '../../../../../db/models/patient_triage.ts'
import findMatching from '../../../../../util/findMatching.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import { notifications } from '../../../../../db/models/notifications.ts'
import assertLength from '../../../../../util/assertLength.ts'
import { referrals } from '../../../../../db/models/referrals.ts'
import first from '../../../../../util/first.ts'
import { addSessionForEmployee, addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'

describeParallel('triage/route_patient', () => {
  before(waitUntilTestServerUp)
  before(() => events.initializeAllProcessedPubSub())
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  itParallel(
    'routes to the referral placed page after referring an anaphylaxis case, creating a notification for another health worker',
    async () => {
      const insect_bite_s_expr = '(clinical_finding (snomed_concept "Itching" "finding"))'
      const { $: $additional_tasks, patient_encounter_id, shcp, postStep, getStep } = await setupTriageNewPatient({
        patient_demographics: randomDemographics('ZA', 'female', 'adult'),
        warning_signs: asWarningSignsAdult([], { pregnant: false }, insect_bite_s_expr),
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
            blood_pressure_systolic: 88, // Low
            blood_pressure_diastolic: 70, // Low
            temperature: 37.6,
          }),
          assessments: asVitalAssessmentFormValues({
            mobility_assessment: 'Walking',
            consciousness: 'Alert',
            trauma_presence: 'No',
          }),
        },
      })

      await events.allProcessedForEncounter(db, { patient_encounter_id })

      const encounter_after_reported_itching_low_blood_pressure = await patient_encounters.getById(db, patient_encounter_id)
      assertEquals(encounter_after_reported_itching_low_blood_pressure.priority!.name, 'Non-urgent')

      // deno-lint-ignore no-explicit-any
      const additional_tasks_form_values: any = getFormValues($additional_tasks)

      // Set sudden-onset itching to Yes (satisfies probable anaphylaxis rule with existing low BP),
      // everything else to No (avoid triggering cascading tasks like mouth/throat)
      const additional_tasks_post_data = structuredClone(additional_tasks_form_values)
      for (const key in additional_tasks_post_data.check_for) {
        if (key === 'finding-sudden-onset-itching') {
          additional_tasks_post_data.check_for[key].existence = 'Yes'
        } else if (!additional_tasks_post_data.check_for[key].existence) {
          additional_tasks_post_data.check_for[key].existence = 'No'
        }
      }

      await postStep({
        additional_tasks_and_investigations: additional_tasks_post_data,
        assign_priority: {},
      })

      const encounter_after_reported_yes_to_all_anaphylaxis_findings = await patient_encounters.getById(db, patient_encounter_id)
      assertEquals(encounter_after_reported_yes_to_all_anaphylaxis_findings.priority!.name, 'Urgent')

      const associated_findings = await patient_triage.associatedFindings(db, encounter_after_reported_yes_to_all_anaphylaxis_findings.priority!)
      const anaphylaxis_diagnosis = findMatching(associated_findings, {
        'root_snomed_concept_name': 'Diagnosis',
        'specific_snomed_concept_name': 'Anaphylaxis',
      })
      assert(isObjectLike(anaphylaxis_diagnosis.value))
      assertEquals(anaphylaxis_diagnosis.value.name, 'Probable diagnosis (contextual qualifier)')

      const $route_patient = await getStep('route_patient')

      const route_patient_form_values = getFormValues($route_patient)
      const _route_patient_form_labels = getFormLabels($route_patient)
      const _route_patient_form_options = getFormOptions($route_patient)

      assertMatches(route_patient_form_values, {
        'next_step': 'check_with_colleague' as const,
        'health_worker_ids_to_be_notified': [shcp.id],
        'notes': null,
      }, { strict: true })

      const notifications_of_shcp_prior = await notifications.findAll(db, {
        health_worker_id: shcp.id,
      })
      assertLength(notifications_of_shcp_prior, 0)

      const $check_with_colleague = await postStep({
        route_patient: route_patient_form_values,
      })

      assert($check_with_colleague.url.endsWith('/open_encounter/check_with_colleague/await_orders'))

      const notifications_of_shcp_post = await notifications.findAll(db, {
        health_worker_id: shcp.id,
      })
      assertLength(notifications_of_shcp_post, 1)
    },
  )

  itParallel(
    'creates a referral whose endpoint is visible only to the originator and recipients, tracking seen/reviewing/reverted states across page reloads',
    async () => {
      const { patient_encounter_id, clinic, nurse, shcp, postStep, openEncounterRoute } = await setupTriageNewPatient({
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
            respiratory_rate: 12,
            heart_rate: 60,
            blood_pressure_systolic: 120,
            blood_pressure_diastolic: 80,
            temperature: 36.6,
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

      const $await_orders = await postStep({
        route_patient: {
          next_step: 'check_with_colleague',
          health_worker_ids_to_be_notified: [shcp.id],
        },
      })
      assert($await_orders.url.endsWith('/open_encounter/check_with_colleague/await_orders'))

      const referrals_of_encounter = await referrals.findAll(db, { patient_encounter_id })
      assertLength(referrals_of_encounter, 1)
      const referral = first(referrals_of_encounter)
      assert(referral)
      const referral_route = `/app/referrals/${referral.id}`

      function shcpState(referral_json: {
        recipients: {
          health_worker: { id: string }
          referral_state: { state: string; as_of: string }
        }[]
      }) {
        return findMatching(
          referral_json.recipients,
          (recipient) => recipient.health_worker.id === shcp.id,
        ).referral_state
      }

      // The originator and the notified recipient can both view the referral
      const shcp_with_session = await addSessionForEmployee(db, shcp)
      const not_seen_state = shcpState(await nurse.fetchJSON(referral_route))
      assertEquals(not_seen_state.state, 'not_seen')
      assertEquals(shcpState(await shcp_with_session.fetchJSON(referral_route)).state, 'not_seen')

      // An uninvolved colleague at the same clinic gets a 404
      const unrelated_colleague = await addTestEmployeeWithSession(db, {
        role: 'nurse',
        specialty: 'Primary care',
        organization_id: clinic.id,
        seniority_order: 3,
      })
      const unrelated_response = await unrelated_colleague.fetch(referral_route)
      assertEquals(unrelated_response.status, 404)
      await unrelated_response.body?.cancel()

      // The await_orders page initially shows the recipient has not seen the referral
      assert($await_orders.text().includes('Not seen yet'))

      // Once the recipient marks the notification seen, the state becomes 'seen'
      const shcp_notifications = await notifications.findAll(db, { health_worker_id: shcp.id })
      assertLength(shcp_notifications, 1)
      const notification = first(shcp_notifications)
      assert(notification)
      await shcp_with_session.fetchJSON('/app/notifications/seen', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ notification_ids: [notification.notification_id] }),
      })

      const seen_state = shcpState(await nurse.fetchJSON(referral_route))
      assertEquals(seen_state.state, 'seen')
      assert(new Date(seen_state.as_of) > new Date(not_seen_state.as_of))

      const $after_seen = await nurse.fetchCheerio(openEncounterRoute('check_with_colleague/await_orders'))
      assert(!$after_seen.text().includes('Not seen yet'))
      assert($after_seen.text().includes('Seen'))

      // Once the recipient starts the chart review workflow, the state becomes 'reviewing'
      await shcp_with_session.fetchCheerio(
        openEncounterRoute('start-workflow/chart_review'),
        { method: 'POST' },
      )

      const reviewing_state = shcpState(await nurse.fetchJSON(referral_route))
      assertEquals(reviewing_state.state, 'reviewing')
      assert(new Date(reviewing_state.as_of) > new Date(seen_state.as_of))

      const $reviewing = await nurse.fetchCheerio(openEncounterRoute('check_with_colleague/await_orders'))
      assert($reviewing.text().includes('Reviewing chart'))

      // Once the recipient completes the chart review workflow, the state becomes 'reverted'
      await shcp_with_session.fetchCheerio(
        openEncounterRoute('chart_review/review_case'),
        { method: 'POST' },
      )
      await shcp_with_session.fetchCheerio(
        openEncounterRoute('chart_review/give_orders'),
        { method: 'POST' },
      )

      const reverted_state = shcpState(await nurse.fetchJSON(referral_route))
      assertEquals(reverted_state.state, 'reverted')
      assert(new Date(reverted_state.as_of) > new Date(reviewing_state.as_of))

      const $reverted = await nurse.fetchCheerio(openEncounterRoute('check_with_colleague/await_orders'))
      assert($reverted.text().includes('Chart reverted'))
    },
  )

  itParallel(
    'routes to the waiting room page when next step is await_consultation',
    async () => {
      const { $: $route_patient, patient_encounter_id, postStep } = await setupTriageNewPatient({
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
    },
  )
})
