// =============================================================================
// FILE: /islands/tutorial/steps/AdditionalTasksStep.tsx
// Additional tasks step wrapper for tutorial - uses real AdditionalTasks component
// =============================================================================

import AdditionalTasks from '../../../components/triage/AdditionalTasks.tsx'
import { getTutorialTaskGroups } from '../../../shared/tutorial/mock-data.ts'

/**
 * Additional tasks step - wraps real AdditionalTasks component with mock data.
 * Shows respiratory check-for tasks due to cough + asthma.
 * All tasks answered "No" - none of the serious conditions apply to Duduzile.
 */
export function AdditionalTasksStep() {
  const task_groups = getTutorialTaskGroups()

  return (
    <div data-tutorial='additional-tasks'>
      <AdditionalTasks
        task_groups={task_groups}
        organization_id='tutorial-org'
      />
    </div>
  )
}
