// =============================================================================
// FILE: /islands/tutorial/steps/AdditionalTasksStep.tsx
// Additional tasks step wrapper for tutorial - uses real AdditionalTasks component
// =============================================================================

import { useMemo } from 'preact/hooks'
import AdditionalTasks from '../../../components/triage/AdditionalTasks.tsx'
import { getTutorialCheckForFollowUps, getTutorialTaskGroups } from '../../../shared/tutorial/mock-data.ts'

/**
 * Additional tasks step - wraps real AdditionalTasks component with mock data.
 * Shows anaphylaxis check-for tasks due to insect bite.
 * The insect bite is pre-filled as Yes; other signs are unanswered for the user to fill in.
 */
export function AdditionalTasksStep() {
  const task_groups = useMemo(() => getTutorialTaskGroups(), [])
  const check_for_follow_ups = useMemo(() => getTutorialCheckForFollowUps(), [])

  return (
    <div data-tutorial='additional-tasks'>
      <AdditionalTasks
        task_groups={task_groups}
        check_for_follow_ups={check_for_follow_ups}
        none_of_the_above_findings_route={null}
        organization_id='tutorial-org'
      />
    </div>
  )
}
