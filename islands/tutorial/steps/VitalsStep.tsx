// =============================================================================
// FILE: /islands/tutorial/steps/VitalsStep.tsx
// Vitals measurement step wrapper for tutorial - uses REAL VitalsMeasurementsForm
// =============================================================================

import { VitalsMeasurementsForm } from '../../../components/vitals/MeasurementsForm.tsx'
import { getTutorialVitalsDefinitions, TUTORIAL_HEIGHT_WEIGHT } from '../../../shared/tutorial/mock-data.ts'

/**
 * Vitals step - wraps the real VitalsMeasurementsForm component
 * with tutorial-specific mock data.
 *
 * Includes SpO2 measurement because Duduzile has:
 * - Cough (respiratory symptom)
 * - Asthma (pre-existing respiratory condition)
 *
 * Form starts blank; values are filled in one at a time by the tutorial overlay
 * as each vital dialogue step is advanced to.
 */
export function VitalsStep() {
  const { measurements, assessments } = getTutorialVitalsDefinitions()

  return (
    <div data-tutorial='vitals-form'>
      <VitalsMeasurementsForm
        vital_measurements_for_this_encounter={measurements}
        triage_assessments={assessments}
        most_recent_patient_vitals={TUTORIAL_HEIGHT_WEIGHT}
        organization_id='tutorial-org'
      />
    </div>
  )
}
