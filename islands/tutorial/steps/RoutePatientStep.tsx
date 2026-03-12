// =============================================================================
// FILE: /islands/tutorial/steps/RoutePatientStep.tsx
// Route patient step - wraps RegistrationRoutePatientSection with mock data
// =============================================================================

import { getTutorialRoutePatientData, TUTORIAL_CLINIC_EMPLOYEES } from '../../../shared/tutorial/mock-data.ts'
import TriageRoutePatientSection from '../../triage/RoutePatientSection.tsx'

/**
 * Route patient step for tutorial.
 * Shows routing options after triage is complete.
 */
export function RoutePatientStep() {
  const { this_visit, patient_names } = getTutorialRoutePatientData()

  return (
    <div data-tutorial='route-patient'>
      <TriageRoutePatientSection
        this_visit={this_visit}
        patient={{
          names: patient_names,
          gender: 'woman',
        }}
        priority={{
          name: 'Urgent' as const,
          target_treatment_time: new Date(),
        }}
        clinic_employees={TUTORIAL_CLINIC_EMPLOYEES}
      />
    </div>
  )
}
