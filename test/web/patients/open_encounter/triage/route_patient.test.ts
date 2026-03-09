import { afterAll, before } from 'std/testing/bdd.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { asVitalAssessmentFormValues, asVitalMeasurementFormValues, asWarningSignsAdult, setupTriageNewPatient } from './_setup.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { events } from '../../../../../db/models/events.ts'
import { getFormLabels, getFormOptions, getFormValues } from 'test/_helpers/form.ts'
import { logReadableJson } from '../../../../../util/humanReadableJson.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { patient_encounters } from '../../../../../db/models/patient_encounters.ts'
import { assert } from 'std/assert/assert.ts'

import { patient_triage } from '../../../../../db/models/patient_triage.ts'
import findMatching from '../../../../../util/findMatching.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'

describeParallel('triage/additional_tasks_and_investigations', () => {
  before(waitUntilTestServerUp)
  before(async () => {
    await events.initializeAllProcessedPubSub()
  })
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  itParallel(
    'routes to the referral placed page after referring an anaphylaxis case, ',
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

      // Check yes for everything
      const additional_tasks_post_data = structuredClone(additional_tasks_form_values)
      for (const key in additional_tasks_post_data.check_for) {
        additional_tasks_post_data.check_for[key].existence = additional_tasks_post_data.check_for[key].existence || 'Yes'
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
      const route_patient_form_labels = getFormLabels($route_patient)
      const route_patient_form_options = getFormOptions($route_patient)
      assertMatches(route_patient_form_values, {
        'next_step': 'refer_case' as const,
        'health_worker_ids_to_be_notified': [shcp.id],
        'notes': null,
      }, { strict: true })
      logReadableJson({ route_patient_form_labels })
      logReadableJson({ route_patient_form_options })

      const $referral_placed = await postStep({
        route_patient: route_patient_form_values,
      })

      assert($referral_placed.url.endsWith('/open_encounter/referral_placed/confirm_handoff'))
    },
  )
})
