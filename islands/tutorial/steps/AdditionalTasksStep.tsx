// =============================================================================
// FILE: /islands/tutorial/steps/AdditionalTasksStep.tsx
// Additional tasks step wrapper for tutorial - uses real AdditionalTasks component
// =============================================================================

import AdditionalTasks from '../../../components/triage/AdditionalTasks.tsx'
import { getTutorialTaskGroups } from '../../../shared/tutorial/mock-data.ts'

/**
 * Additional tasks step - wraps real AdditionalTasks component with mock data.
 * Shows anaphylaxis check-for tasks due to insect bite.
 * The insect bite is pre-filled as Yes; other signs are unanswered for the user to fill in.
 */
export function AdditionalTasksStep() {
  const task_groups = getTutorialTaskGroups()

  return (
    <div data-tutorial='additional-tasks'>
      <AdditionalTasks
        task_groups={task_groups}
        organization_id='tutorial-org'
        evaluation_ids={[]}
      />
    </div>
  )
}
