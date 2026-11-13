// =============================================================================
// FILE: /islands/tutorial/steps/BriefHistoryStep.tsx
// Brief history step wrapper for tutorial - uses real component with mock data
// =============================================================================

import { BriefHistorySection } from '../../../components/triage/BriefHistorySection.tsx'
import { TUTORIAL_BRIEF_HISTORY_ALLERGIES, TUTORIAL_BRIEF_HISTORY_COMMON_CONDITIONS } from '../../../shared/tutorial/mock-data.ts'
import type { Sex } from '../../../types.ts'

type Props = {
  sex: Sex
}

/**
 * Brief history step - wraps real BriefHistorySection with mock data.
 * All conditions pre-filled as No, recorded 6 months ago.
 */
export function BriefHistoryStep({ sex }: Props) {
  return (
    <div data-tutorial='brief-history-section'>
      <BriefHistorySection
        most_recent_findings={TUTORIAL_BRIEF_HISTORY_COMMON_CONDITIONS}
        additional_chronic_conditions={[]}
        existing_allergies={TUTORIAL_BRIEF_HISTORY_ALLERGIES}
        existing_medications={[]}
        sex={sex}
        organization_id='tutorial-org'
      />
    </div>
  )
}
