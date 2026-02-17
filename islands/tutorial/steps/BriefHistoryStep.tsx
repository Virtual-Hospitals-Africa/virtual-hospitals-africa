// =============================================================================
// FILE: /islands/tutorial/steps/BriefHistoryStep.tsx
// Brief history step wrapper for tutorial - uses real component with mock data
// =============================================================================

import { BriefHistorySection } from '../../../components/triage/BriefHistorySection.tsx'
import { TUTORIAL_BRIEF_HISTORY } from '../../../shared/tutorial/mock-data.ts'
import type { Sex } from '../../../types.ts'

type Props = {
  sex: Sex
}

/**
 * Brief history step - wraps real BriefHistorySection with mock data.
 * Duduzile has: asthma (Yes), diabetes (No), pregnancy (No)
 */
export function BriefHistoryStep({ sex }: Props) {
  return (
    <div data-tutorial='brief-history-section'>
      <BriefHistorySection
        most_recent_findings={TUTORIAL_BRIEF_HISTORY}
        sex={sex}
        organization_id='tutorial-org'
      />
    </div>
  )
}
