import { TriageAssignPriorityTable } from '../../../components/triage/AssignPriorityTable.tsx'
import { getConsultationAssignPriorityData } from '../../../shared/consultation-tutorial/mock-data.ts'

export function TriageAssignPriorityStep() {
  const { vitals, total_score, priority } = getConsultationAssignPriorityData()

  return (
    <div data-tutorial='assign-priority-table'>
      <TriageAssignPriorityTable
        rows={vitals}
        total_score={total_score}
        priority={priority}
      />
    </div>
  )
}
