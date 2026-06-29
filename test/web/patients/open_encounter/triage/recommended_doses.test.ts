import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import db from '../../../../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { asVitalAssessmentFormValues, asVitalMeasurementFormValues, asWarningSignsAdult, setupTriageNewPatient } from './_setup.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { RECOMMENDED_DOSE_CALCULATOR_DISCLAIMER } from '../../../../../shared/snomed_to_icd10.ts'

describeParallel('triage/recommended_doses', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  itParallel('shows suggested doses from encounter SNOMED concepts after assign priority', async () => {
    const asthma_s_expr = '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Asthma" "disorder"))'
    const { $, postStep } = await setupTriageNewPatient({
      patient_demographics: randomDemographics('ZA', 'male', 'adult'),
      warning_signs: asWarningSignsAdult([], { pregnant: false }, asthma_s_expr),
      brief_history: {
        common_conditions: {
          diabetes: { existence: 'No' },
          pregnancy: { existence: 'No' },
        },
      },
      height_and_weight: {
        measurements: {
          height: { value: 180, units: 'cm' },
          weight: { value: 80, units: 'kg' },
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

    assert($.url.endsWith('/open_encounter/triage/recommended_doses'))
    const body = $.html()
    assert(body.includes('Suggested medication doses'))
    assert(body.includes(RECOMMENDED_DOSE_CALCULATOR_DISCLAIMER))
    assert(body.includes('Suggested medications (for your review)'))

    const $route_patient = await postStep({ recommended_doses: {} })
    assert($route_patient.url.endsWith('/open_encounter/triage/route_patient'))
  })
})
