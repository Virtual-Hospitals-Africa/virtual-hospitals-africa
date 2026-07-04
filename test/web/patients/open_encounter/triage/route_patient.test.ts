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

describeParallel('triage/additional_tasks_and_investigations', () => {
  before(waitUntilTestServerUp)
  before(() => events.initializeAllProcessedPubSub())
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  itParallel(
    'routes to the referral placed page after referring an anaphylaxis case, creating a notification for another health worker',
    async () => {
      const insect_bite_s_expr = '(clinical_finding (snomed_concept "Itching" "finding"))'
      const { $: $additional_tasks, patient_encounter_id, shcp, postStep } = await setupTriageNewPatient({
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

      const $route_patient = await postStep({
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
