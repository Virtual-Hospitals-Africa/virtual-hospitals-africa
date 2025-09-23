import { EmptyState } from '../components/library/EmptyState.tsx'
import AsyncSearch from './AsyncSearch.tsx'
import { FamilyHistoryFormPanel } from './FamilyHistoryFormPanel.tsx'
import { RenderedPatientFamilyHistory } from '../types.ts'
import isString from '../util/isString.ts'
import { useLocationHash } from '../util/useLocationHash.ts'

type FamilyHistoryPageProps = {
  patient_family_history_records: RenderedPatientFamilyHistory[]
}

type PanelState =
  | { action: 'edit'; editing_id: string }
  | {
    action: 'new'
    new_family_history_snomed_concept_id: string
    new_family_history_name: string
  }

function isPanelState(state: Record<string, string>): state is PanelState {
  if (isString(state.editing_id)) {
    return true
  }
  if (
    isString(state.new_family_history_snomed_concept_id) &&
    isString(state.new_family_history_name)
  ) {
    return true
  }
  return false
}

export function FamilyHistoryPage(_props: FamilyHistoryPageProps) {
  const panel_state = useLocationHash(isPanelState)

  return (
    <>
      <AsyncSearch
        search_route='/app/family_history'
        onSelect={(
          option?: { id: string; name: string },
        ) => {
          panel_state.value = option
            ? {
              action: 'new',
              new_family_history_snomed_concept_id: option.id,
              new_family_history_name: option.name,
            }
            : {
              action: 'none',
            }
        }}
      />
      <EmptyState
        header='No family history added yet'
        explanation="Search for conditions or select from the suggestions above to add to the patient's family history."
      />
      <FamilyHistoryFormPanel
        show={panel_state.value.action === 'new'}
        family_history={{
          name: panel_state.value.action === 'new'
            ? panel_state.value.new_family_history_name
            : undefined,
          snomed_concept_id: panel_state.value.action === 'new'
            ? panel_state.value.new_family_history_snomed_concept_id
            : undefined,
        }}
        onClose={() => panel_state.value = { action: 'none' }}
      />
    </>
  )
}
