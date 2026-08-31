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
      assertEquals(
        encounter_after_reported_itching_low_blood_pressure.priority!.name,
        'Non-urgent',
        'Reported itching with low blood pressure alone should not raise the priority above Non-urgent before the additional tasks are answered',
      )

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
      assertEquals(
        encounter_after_reported_yes_to_all_anaphylaxis_findings.priority!.name,
        'Urgent',
        'Sudden-onset itching plus low blood pressure satisfies the probable anaphylaxis rule, which should escalate the priority to Urgent',
      )

      const associated_findings = await patient_triage.associatedFindings(db, encounter_after_reported_yes_to_all_anaphylaxis_findings.priority!)
      const anaphylaxis_diagnosis = findMatching(associated_findings, {
        'root_snomed_concept_name': 'Diagnosis',
        'specific_snomed_concept_name': 'Anaphylaxis',
      })
      assert(
        isObjectLike(anaphylaxis_diagnosis.value),
        'The Anaphylaxis diagnosis associated with the priority should carry an object value describing the diagnostic certainty',
      )
      assertEquals(
        anaphylaxis_diagnosis.value.name,
        'Probable diagnosis (contextual qualifier)',
        'The anaphylaxis rule matched on findings rather than a confirmed diagnosis, so the diagnosis should be recorded as probable',
      )

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
      assertLength(notifications_of_shcp_prior, 0, 'The SHCP should have no notifications before the nurse submits the route_patient step')

      const $check_with_colleague = await postStep({
        route_patient: route_patient_form_values,
      })

      assert(
        $check_with_colleague.url.endsWith('/open_encounter/check_with_colleague/await_orders'),
        `Routing to check_with_colleague should land on the await_orders page, but landed on ${$check_with_colleague.url}`,
      )

      const notifications_of_shcp_post = await notifications.findAll(db, {
        health_worker_id: shcp.id,
      })
      assertLength(notifications_of_shcp_post, 1, 'Referring the case to the SHCP should have created exactly one notification for them')
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
      assert(
        $await_orders.url.endsWith('/open_encounter/check_with_colleague/await_orders'),
        `Routing to check_with_colleague should land on the await_orders page, but landed on ${$await_orders.url}`,
      )

      const referrals_of_encounter = await referrals.findAll(db, { patient_encounter_id })
      assertLength(referrals_of_encounter, 1, 'Routing to check_with_colleague should have created exactly one referral for the encounter')
      const referral = first(referrals_of_encounter)
      assert(referral, 'Expected the encounter to have a referral after routing to check_with_colleague')
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
      assertEquals(
        not_seen_state.state,
        'not_seen',
        "The originator should see the recipient's referral state as not_seen before the recipient opens their notification",
      )
      assertEquals(
        shcpState(await shcp_with_session.fetchJSON(referral_route)).state,
        'not_seen',
        'The recipient should also see their own referral state as not_seen before they mark the notification seen',
      )

      // An uninvolved colleague at the same clinic gets a 404
      const unrelated_colleague = await addTestEmployeeWithSession(db, {
        role: 'nurse',
        specialty: 'Primary care',
        organization_id: clinic.id,
        seniority_order: 3,
      })
      const unrelated_response = await unrelated_colleague.fetch(referral_route)
      assertEquals(
        unrelated_response.status,
        404,
        'A colleague at the same clinic who is neither the originator nor a recipient should not be able to see the referral',
      )
      await unrelated_response.body?.cancel()

      // The await_orders page initially shows the recipient has not seen the referral
      assert(
        $await_orders.text().includes('Not seen yet'),
        'The await_orders page should report that the recipient has not seen the referral yet',
      )

      // Once the recipient marks the notification seen, the state becomes 'seen'
      const shcp_notifications = await notifications.findAll(db, { health_worker_id: shcp.id })
      assertLength(shcp_notifications, 1, 'The referral should have created exactly one notification for the recipient SHCP')
      const notification = first(shcp_notifications)
      assert(notification, 'Expected the recipient SHCP to have a notification to mark as seen')
      await shcp_with_session.fetchJSON('/app/notifications/seen', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ notification_ids: [notification.notification_id] }),
      })

      const seen_state = shcpState(await nurse.fetchJSON(referral_route))
      assertEquals(seen_state.state, 'seen', 'Marking the notification seen should move the referral state to seen')
      assert(
        new Date(seen_state.as_of) > new Date(not_seen_state.as_of),
        `The seen state should be timestamped after the not_seen state, but seen was ${seen_state.as_of} and not_seen was ${not_seen_state.as_of}`,
      )

      const $after_seen = await nurse.fetchCheerio(openEncounterRoute('check_with_colleague/await_orders'))
      assert(
        !$after_seen.text().includes('Not seen yet'),
        'After the recipient saw the notification, the await_orders page should no longer say the referral is not seen yet',
      )
      assert($after_seen.text().includes('Seen'), 'After the recipient saw the notification, the await_orders page should report the referral as seen')

      // Once the recipient starts the chart review workflow, the state becomes 'reviewing'
      await shcp_with_session.fetchCheerio(
        openEncounterRoute('start-workflow/chart_review'),
        { method: 'POST' },
      )

      const reviewing_state = shcpState(await nurse.fetchJSON(referral_route))
      assertEquals(reviewing_state.state, 'reviewing', 'Starting the chart_review workflow should move the referral state to reviewing')
      assert(
        new Date(reviewing_state.as_of) > new Date(seen_state.as_of),
        `The reviewing state should be timestamped after the seen state, but reviewing was ${reviewing_state.as_of} and seen was ${seen_state.as_of}`,
      )

      const $reviewing = await nurse.fetchCheerio(openEncounterRoute('check_with_colleague/await_orders'))
      assert(
        $reviewing.text().includes('Reviewing chart'),
        'The await_orders page should report that the recipient is reviewing the chart once they start the chart_review workflow',
      )

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
      assertEquals(reverted_state.state, 'reverted', 'Completing the chart_review workflow should move the referral state to reverted')
      assert(
        new Date(reverted_state.as_of) > new Date(reviewing_state.as_of),
        `The reverted state should be timestamped after the reviewing state, but reverted was ${reverted_state.as_of} and reviewing was ${reviewing_state.as_of}`,
      )

      const $reverted = await nurse.fetchCheerio(openEncounterRoute('check_with_colleague/await_orders'))
      assert(
        $reverted.text().includes('Chart reverted'),
        'The await_orders page should report that the chart was reverted once the recipient finishes giving orders',
      )
    },
  )

  itParallel(
    'routes to the waiting room page when next step is await_consultation',
    async () => {
      const { $: $route_patient, clinic, patient_id, patient_encounter_id, shcp, postStep } = await setupTriageNewPatient({
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
      assertEquals(encounter.priority!.name, 'Non-urgent', 'Normal vitals with no warning signs should result in a Non-urgent priority')

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

      assert(
        new URL($await_consultation.url).pathname.endsWith('/waiting_room'),
        `Routing to await_consultation should land on the waiting room page, but landed on ${$await_consultation.url}`,
      )

      // The triage nurse sees the consultation action, but cannot start it
      assertEquals(
        $await_consultation('[data-column="actions"] button').text(),
        'Consultation',
        'The waiting room should show the consultation as the next action for this patient',
      )
      assertEquals(
        $await_consultation('[data-column="actions"] button').attr('disabled'),
        'disabled',
        'The triage nurse is not qualified to run the consultation, so the action should be disabled for them',
      )

      // The SHCP can start the consultation from the waiting room, arriving on the findings page
      const shcp_session = await addSessionForEmployee(db, shcp)
      const $waiting_room = await shcp_session.fetchCheerio($await_consultation.url)

      assertEquals(
        $waiting_room('[data-column="actions"] button').text(),
        'Start Consultation',
        'The SHCP should be offered the action to start the consultation from the waiting room',
      )
      assertEquals(
        $waiting_room('[data-column="actions"] button').attr('disabled'),
        undefined,
        'The SHCP is qualified to run the consultation, so the action should not be disabled for them',
      )

      const start_consultation_action = $waiting_room('[data-column="actions"] form').attr('action')!
      assertEquals(
        start_consultation_action,
        `/app/organizations/${clinic.id}/patients/${patient_id}/open_encounter/start-workflow/consultation`,
        "The waiting room's start consultation form should post to the start-workflow/consultation route for this patient's open encounter",
      )

      const $findings = await shcp_session.fetchCheerio(start_consultation_action, { method: 'POST' })
      assert(
        new URL($findings.url).pathname.endsWith('/consultation/findings'),
        `Starting the consultation should land on the findings page, but landed on ${$findings.url}`,
      )
    },
  )
})
