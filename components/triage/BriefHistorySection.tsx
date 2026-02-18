// =============================================================================
// FILE: /components/triage/BriefHistorySection.tsx
// Brief history section - displays common conditions in a yes/no grid
// =============================================================================

import { YesNoGrid, YesNoQuestion } from '../../islands/form/inputs/yes_no.tsx'
import { MostRecentRecord } from '../../islands/MostRecentRecord.tsx'
import { AllergiesMultiSelect } from '../../islands/triage/AllergiesMultiSelect.tsx'
import { COMMON_CONDITIONS, CommonCondition } from '../../shared/brief_history.ts'
import type {
  Existence,
  Maybe,
  MostRecentBriefHistoryFindings,
  RenderedBriefHistoryRelativeToHealthWorker,
  RenderedFindingRelativeToHealthWorker,
  Sex,
} from '../../types.ts'

export function CommonConditionRow(
  { condition, most_recent_finding, sex, organization_id }: {
    condition: CommonCondition
    most_recent_finding: Maybe<RenderedBriefHistoryRelativeToHealthWorker>
    sex: Sex
    organization_id: string
  },
) {
  const value: Existence | undefined = !most_recent_finding && condition.key === 'pregnancy' && sex === 'male' ? 'No' : most_recent_finding?.existence

  return (
    <YesNoQuestion
      name={`common_conditions.${condition.key}.existence`}
      required={condition.required}
      value={value}
      label={condition.label}
      most_recent_finding={
        <MostRecentRecord
          record={most_recent_finding}
          organization_id={organization_id}
        />
      }
    />
  )
}

export function BriefHistorySection(
  { most_recent_findings, existing_allergies, sex, organization_id }: {
    most_recent_findings: MostRecentBriefHistoryFindings
    existing_allergies: RenderedFindingRelativeToHealthWorker[]
    sex: Sex
    organization_id: string
  },
) {
  return (
    <>
      <YesNoGrid title='Condition'>
        {COMMON_CONDITIONS.map((condition) => (
          <CommonConditionRow
            key={condition.key}
            condition={condition}
            sex={sex}
            organization_id={organization_id}
            most_recent_finding={most_recent_findings[condition.key]}
          />
        ))}
      </YesNoGrid>
      <AllergiesMultiSelect
        existing_allergies={existing_allergies}
        organization_id={organization_id}
      />
    </>
  )
}
