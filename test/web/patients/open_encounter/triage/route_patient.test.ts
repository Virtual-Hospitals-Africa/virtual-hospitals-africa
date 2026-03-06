import { afterAll, before } from 'std/testing/bdd.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { asVitalAssessmentFormValues, asVitalMeasurementFormValues, asWarningSigns, setupTriageNewPatient } from './_setup.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { events } from '../../../../../db/models/events.ts'
import { getFormLabels, getFormOptions, getFormValues } from 'test/_helpers/form.ts'
import { logReadableJson } from '../../../../../util/humanReadableJson.ts'

describeParallel('triage/additional_tasks_and_investigations', () => {
  before(waitUntilTestServerUp)
  before(async () => {
    await events.initializeAllProcessedPubSub()
  })
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  itParallel(
    'upgrades a possible diagnosis for anaphylaxis to a probable diagnosis after meeting prompted for checks',
    async () => {
      const insect_bite_s_expr = '(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))'
      const { $, patient_encounter_id, postStep } = await setupTriageNewPatient({
        patient_demographics: randomDemographics('ZA', 'female', 'adult'),
        warning_signs: asWarningSigns([], { pregnant: false }, insect_bite_s_expr),
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

      await events.allProcessedForEncounter(db, { patient_encounter_id })

      // deno-lint-ignore no-explicit-any
      const form_values: any = getFormValues($)

      const additional_tasks_post_data = structuredClone(form_values)
      for (const key in additional_tasks_post_data.check_for) {
        additional_tasks_post_data.check_for[key].existence = additional_tasks_post_data.check_for[key].existence || 'Yes'
      }

      const $route_patient = await postStep({
        additional_tasks_and_investigations: additional_tasks_post_data,
        assign_priority: {},
      })

      const route_patient_form_values = getFormValues($route_patient)
      const route_patient_form_labels = getFormLabels($route_patient)
      const route_patient_form_options = getFormOptions($route_patient)
      logReadableJson(route_patient_form_values)
      logReadableJson(route_patient_form_labels)
      logReadableJson(route_patient_form_options)
    },
  )
})
