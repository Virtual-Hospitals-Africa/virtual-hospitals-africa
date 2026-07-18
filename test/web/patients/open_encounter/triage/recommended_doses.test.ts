import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import db from '../../../../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { asVitalAssessmentFormValues, asVitalMeasurementFormValues, asWarningSignsAdult, setupTriageNewPatient } from './_setup.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'

describeParallel('triage/route_patient recommended medicines', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  itParallel('recommends medicines due to encounter SNOMED concepts in the care plan, showing who can prescribe', async () => {
    const asthma_s_expr = '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Asthma" "disorder"))'
    const { $ } = await setupTriageNewPatient({
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

    // The dedicated recommended_doses step is gone: assign_priority proceeds
    // straight to route_patient, where the care plan holds the medicines.
    assert($.url.endsWith('/open_encounter/triage/route_patient'))
    assert($.html().includes('Recommended Care Plan'))

    // The asthma finding maps to ICD-10 J45* and recommends salbutamol, in a
    // care plan card attributed to the finding
    const asthma_card = $('.task-group-card[data-due-to*="asthma"]')
    assert(asthma_card.length, 'expected a care plan card due to asthma')
    assert(asthma_card.find('[data-medicine="salbutamol"]').length, 'expected salbutamol to be recommended due to asthma')

    // Doctor-only options can't be prescribed by the triage nurse, and this
    // clinic staffs no doctor, so a doctor role icon is shown
    assert($.html().includes('Prescribable by'))
    assert($('[data-permitted="doctor"]').length, 'expected a doctor role icon for doctor-only prescriptions')
  })
})
