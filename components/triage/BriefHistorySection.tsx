// =============================================================================
// FILE: /components/triage/BriefHistorySection.tsx
// Brief history section - displays common conditions in a yes/no grid
// =============================================================================

import { AdditionalChronicConditionsMultiSelect } from '../../islands/triage/AdditionalChronicConditionsMultiSelect.tsx'
import { YesNoGrid, YesNoQuestion } from '../../islands/form/inputs/yes_no.tsx'
import { MostRecentRecord } from '../../islands/MostRecentRecord.tsx'
import { AllergiesMultiSelect } from '../../islands/triage/AllergiesMultiSelect.tsx'
import { MedicationsSelfReported } from '../../islands/triage/MedicationsSelfReported.tsx'
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
  { most_recent_findings, additional_chronic_conditions, existing_allergies, existing_medications, sex, organization_id }: {
    most_recent_findings: MostRecentBriefHistoryFindings
    additional_chronic_conditions: RenderedFindingRelativeToHealthWorker[]
    existing_allergies: RenderedFindingRelativeToHealthWorker[]
    existing_medications: RenderedFindingRelativeToHealthWorker[]
    sex: Sex
    organization_id: string
  },
) {
  return (
    <div class='flex flex-col gap-3'>
      <YesNoGrid title='Chronic condition' id='brief-history'>
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
      <AdditionalChronicConditionsMultiSelect existing_conditions={additional_chronic_conditions} organization_id={organization_id} />
      <AllergiesMultiSelect
        existing_allergies={existing_allergies}
        organization_id={organization_id}
      />
      <MedicationsSelfReported
        existing_medications={existing_medications}
        existing_conditions={additional_chronic_conditions.map((condition) => ({
          name: condition.specific_snomed_concept_name,
          category: condition.specific_snomed_concept_category,
        }))}
        organization_id={organization_id}
      />
    </div>
  )
}
