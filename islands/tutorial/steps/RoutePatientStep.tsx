// =============================================================================
// FILE: /islands/tutorial/steps/RoutePatientStep.tsx
// Route patient step - wraps RegistrationRoutePatientSection with mock data
// =============================================================================

import { applyPermissions } from '../../../shared/permissions.ts'
import { buildCarePlanGroups } from '../../../shared/care_plan.ts'
import { triageNextStepRecommendations } from '../../../shared/triage_route_patient.ts'
import {
  getTutorialRoutePatientData,
  TUTORIAL_CLINIC_EMPLOYEES,
  TUTORIAL_MANAGE_PATIENT_TASK_GROUPS,
  TUTORIAL_ORGANIZATION_EMPLOYMENT,
} from '../../../shared/tutorial/mock-data.ts'
import TriageRoutePatientSection from '../../triage/RoutePatientSection.tsx'

/**
 * Route patient step for tutorial.
 * Shows routing options after triage is complete.
 */
export function RoutePatientStep() {
  const { this_visit, patient_names } = getTutorialRoutePatientData()
  const priority = {
    name: 'Urgent' as const,
    target_treatment_time: new Date(),
  }

  const task_groups_with_permissions = applyPermissions(TUTORIAL_ORGANIZATION_EMPLOYMENT, TUTORIAL_CLINIC_EMPLOYEES, TUTORIAL_MANAGE_PATIENT_TASK_GROUPS)
  const triage_next_step_recommendations = triageNextStepRecommendations(
    priority.name,
    TUTORIAL_CLINIC_EMPLOYEES,
    task_groups_with_permissions.flatMap((group) => group.tasks),
  )

  return (
    <div data-tutorial='route-patient'>
      <TriageRoutePatientSection
        this_visit={this_visit}
        patient={{
          names: patient_names,
          gender: 'woman',
        }}
        priority={priority}
        organization_id={TUTORIAL_ORGANIZATION_EMPLOYMENT.id}
        clinic_employees={TUTORIAL_CLINIC_EMPLOYEES}
        care_plan_groups={buildCarePlanGroups(task_groups_with_permissions, [])}
        triage_next_step_recommendations={triage_next_step_recommendations}
      />
    </div>
  )
}
