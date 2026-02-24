import Form from '../../components/library/Form.tsx'
import { RenderedFindingRelativeToHealthWorker } from '../../types.ts'

type SymptomsFormProps = {
  record: RenderedFindingRelativeToHealthWorker
}

export function SymptomsForm({ record }: SymptomsFormProps) {
  record.attributes
  return (
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
  )
}