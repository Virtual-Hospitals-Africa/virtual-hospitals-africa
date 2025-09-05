import { useSignal } from '@preact/signals'
import { Button } from '../components/library/Button.tsx'
import Form from '../components/library/Form.tsx'
import { HiddenInput } from '../components/library/HiddenInput.tsx'
import { AddRow } from './AddRemove.tsx'
import RelationshipSelect from './family/RelationshipSelect.tsx'
import { RightPanel } from './RightPanel.tsx'

type FamilyHistory = Partial<{ name: string; snomed_concept_id: string }>
type FamilyHistoryFormPanelProps = {
  show: boolean
  family_history: FamilyHistory
  onClose(): void
}

type FamilyMember = Partial<{
  relationship_gendered: string
}>

function FamilyHistoryForm(
  { family_history }: { family_history: FamilyHistory },
) {
  console.log(family_history)
  const familyMembers = useSignal<FamilyMember[]>([{}])
  const addFamilyMember = () => {
    familyMembers.value = [
      ...familyMembers.value,
      {},
    ]
  }

  return (
    <Form method='POST'>
      <HiddenInput
        name='family_history.snomed_concept_id'
        value={family_history.snomed_concept_id}
      />
      {familyMembers.value.map((member, index) => (
        <FamilyMemberSection member={member} index={index} />
      ))}
      <AddRow
        text='Add New Family Member For Condition'
        onClick={addFamilyMember}
      />
      <Button>Save</Button>
    </Form>
  )
}

function FamilyMemberSection({
  member,
  index,
}: {
  member: FamilyMember
  index: number
}) {
  return (
    <>
      <RelationshipSelect
        required
        name={`family_history.family_members.${index}.relation_gendered`}
        family_relation_gendered={member.relationship_gendered}
        type='all'
        gender={undefined}
      />
      {
        /* <Gender
        required
        name={`family_members.${index}.family_relation_gendered`}
        family_relation_gendered={undefined}
        type="all"
        gender={undefined}
      />
      <Notes
        required
        name={`family_members.${index}.family_relation_gendered`}
        family_relation_gendered={undefined}
        type="all"
        gender={undefined}
      /> */
      }
    </>
  )
}

export function FamilyHistoryFormPanel({
  show,
  onClose,
  family_history,
}: FamilyHistoryFormPanelProps) {
  return (
    <RightPanel
      show={show}
      onClose={onClose}
      title={family_history.name || 'Family History'}
    >
      <FamilyHistoryForm family_history={family_history} />
    </RightPanel>
  )
}
