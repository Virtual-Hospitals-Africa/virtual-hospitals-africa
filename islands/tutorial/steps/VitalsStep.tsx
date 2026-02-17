// =============================================================================
// FILE: /islands/tutorial/steps/VitalsStep.tsx
// Vitals measurement step wrapper for tutorial - uses REAL VitalsMeasurementsForm
// =============================================================================

import { useEffect, useRef } from 'preact/hooks'
import { VitalsMeasurementsForm } from '../../../components/vitals/MeasurementsForm.tsx'
import { getTutorialVitalsDefinitions, TUTORIAL_ASSESSMENT_VALUES, TUTORIAL_HEIGHT_WEIGHT, TUTORIAL_VITAL_VALUES } from '../../../shared/tutorial/mock-data.ts'

/**
 * Fill form inputs with mock values, similar to devModeFillFormOnJsonPaste.
 */
function fillFormWithMockData(container: HTMLElement) {
  // Fill measurement inputs (text inputs)
  for (const [name, value] of Object.entries(TUTORIAL_VITAL_VALUES)) {
    const input = container.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (!input) continue
    input.value = value
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }

  // Fill assessment selects
  for (const [name, value] of Object.entries(TUTORIAL_ASSESSMENT_VALUES)) {
    const select = container.querySelector(`[name="${name}"]`) as HTMLSelectElement
    if (!select) continue
    select.value = value
    select.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

/**
 * Vitals step - wraps the real VitalsMeasurementsForm component
 * with tutorial-specific mock data.
 *
 * Includes SpO2 measurement because Duduzile has:
 * - Cough (respiratory symptom)
 * - Asthma (pre-existing respiratory condition)
 */
export function VitalsStep() {
  const { measurements, assessments } = getTutorialVitalsDefinitions()
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-fill form with mock vitals on mount
  useEffect(() => {
    if (containerRef.current) {
      fillFormWithMockData(containerRef.current)
    }
  }, [])

  return (
    <div data-tutorial='vitals-form' ref={containerRef}>
      <VitalsMeasurementsForm
        vital_measurements_for_this_encounter={measurements}
        triage_assessments={assessments}
        most_recent_patient_vitals={TUTORIAL_HEIGHT_WEIGHT}
        organization_id='tutorial-org'
      />
    </div>
  )
}
