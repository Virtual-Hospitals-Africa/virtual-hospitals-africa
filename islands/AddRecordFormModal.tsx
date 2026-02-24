import { Button } from '../components/library/Button.tsx'
import Form from '../components/library/Form.tsx'
import isString from '../util/isString.ts'
import { useLocationHash } from '../util/useLocationHash.ts'
import { RightPanel } from './RightPanel.tsx'

type RecordType = 
  'symptom'


type PanelState =
  | { action: 'add_record'; record_type: RecordType }


function isPanelState(state: Record<string, string>): state is PanelState {
  console.log({ state })
  if (isString(state.record_type)) {
    return true
  }
  return false
}

export function AddRecordFormModal() {
  const panel_state = useLocationHash(isPanelState)

  return (
    <RightPanel
      show={panel_state.value.action === 'add_record'}
      onClose={() => (panel_state.value = { action: 'none' })}
      title={`Add ${panel_state.value.action === 'add_record' && panel_state.value.record_type}`}
    >
      <Form method='POST'>
        FOO
        <input></input>
        {/* <HiddenInput
          name='family_history.snomed_concept_id'
          value={family_history.snomed_concept_id}
        />
        <AddRow
          text='Add New Family Member For Condition'
          onClick={addFamilyMember}
        /> */}
        <Button>Save</Button>
      </Form>
    </RightPanel>
  )
}
