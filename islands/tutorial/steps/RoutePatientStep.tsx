// =============================================================================
// FILE: /islands/tutorial/steps/RoutePatientStep.tsx
// Route patient step - wraps RegistrationRoutePatientSection with mock data
// =============================================================================

import RegistrationRoutePatientSection from '../../../components/patient-registration/RoutePatientSection.tsx'
import { getTutorialRoutePatientData } from '../../../shared/tutorial/mock-data.ts'

/**
 * Route patient step for tutorial.
 * Shows routing options after triage is complete.
 */
export function RoutePatientStep() {
  const { this_visit, patient_names, can_do_triage, senior_health_worker_name } = getTutorialRoutePatientData()

  return (
    <div data-tutorial='route-patient'>
      <RegistrationRoutePatientSection
        this_visit={this_visit}
        patient_names={patient_names}
        can_do_triage={can_do_triage}
        senior_health_worker_name={senior_health_worker_name}
      />
    </div>
  )
}
