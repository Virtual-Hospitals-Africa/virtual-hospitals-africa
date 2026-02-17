// =============================================================================
// FILE: /islands/tutorial/steps/AssignPriorityStep.tsx
// Assign priority step wrapper for tutorial - uses real TriageAssignPriorityTable
// =============================================================================

import { TriageAssignPriorityTable } from '../../../components/triage/AssignPriorityTable.tsx'
import { getTutorialAssignPriorityData } from '../../../shared/tutorial/mock-data.ts'

/**
 * Assign priority step - wraps real TriageAssignPriorityTable with mock data.
 * Shows TEWS = 5 (Very Urgent) due to:
 * - Respiratory rate 32 bpm (score 3)
 * - Temperature 38.8°C (score 2)
 */
export function AssignPriorityStep() {
  const { vitals, with_triage_level_findings, total_score, priority } = getTutorialAssignPriorityData()

  return (
    <div data-tutorial='assign-priority-table'>
      <TriageAssignPriorityTable
        vitals={vitals}
        with_triage_level_findings={with_triage_level_findings}
        total_score={total_score}
        priority={priority}
      />
    </div>
  )
}
