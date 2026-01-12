import { RenderedPatientSymptom } from '../../types.ts'

import AsyncSearch from '../AsyncSearch.tsx'
import { EmptyState } from '../../components/library/EmptyState.tsx'
import { SymptomFormPanel } from './FormPanel.tsx'
import { useLocationHash } from '../../util/useLocationHash.ts'
import isString from '../../util/isString.ts'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { PencilIcon } from '../../components/library/icons/heroicons/solid.tsx'
import { Button } from '../../components/library/Button.tsx'
import { TextArea } from '../form/inputs/textarea.tsx'

type PanelState =
  | { action: 'edit'; editing_id: string }
  | {
    action: 'new'
    new_symptom_snomed_concept_id: string
    new_symptom_name: string
  }

function isPanelState(state: Record<string, string>): state is PanelState {
  if (isString(state.editing_id)) {
    return true
  }
  if (
    isString(state.new_symptom_snomed_concept_id) &&
    isString(state.new_symptom_name)
  ) {
    return true
  }
  return false
}

export default function SymptomSection(
  { patient_symptoms, today }: {
    patient_symptoms: RenderedPatientSymptom[]
    today: string
  },
) {
  const panel_state = useLocationHash(isPanelState)

  return (
    <>
      <TextArea name='chief_complaint' label='Chief Complaint' />
      <AsyncSearch
        search_route='/app/symptoms'
        onSelect={(
          option?: { id: string; name: string },
        ) => {
          panel_state.value = option
            ? {
              action: 'new',
              new_symptom_snomed_concept_id: option.id,
              new_symptom_name: option.name,
            }
            : {
              action: 'none',
            }
        }}
      />
      {patient_symptoms.length === 0 && (
        <EmptyState
          header='No symptoms'
          explanation="Search for conditions or select from the suggestions above to add to the patient's family history."
        />
      )}
      {patient_symptoms.map((symptom) => (
        <div>
          Name: {symptom.name}
          Severity: {symptom.severity}
          Start: {symptom.start_date}
          <Button
            href={panel_state.asHref({
              action: 'edit',
              editing_id: symptom.id,
            })}
          >
            <PencilIcon /> Edit
          </Button>
        </div>
      ))}
      {patient_symptoms.map((symptom) => (
        <SymptomFormPanel
          key={symptom.id}
          today={today}
          symptom={symptom}
          show={panel_state.value?.action === 'edit' &&
            panel_state.value?.editing_id === symptom.id}
          onClose={() => panel_state.value = { action: 'none' }}
        />
      ))}
      <SymptomFormPanel
        today={today}
        show={panel_state.value?.action === 'new'}
        symptom={{
          name: panel_state.value.action === 'new' ? panel_state.value.new_symptom_name : undefined,
          snomed_concept_id: panel_state.value.action === 'new' ? panel_state.value.new_symptom_snomed_concept_id : undefined,
        }}
        onClose={() => location.hash = ''}
      />
      <HiddenInput name='done' value />
    </>
  )
}
