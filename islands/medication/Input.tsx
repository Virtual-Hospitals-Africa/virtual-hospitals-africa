import DrugInput from '../drug/Input.tsx'
import { PatientConditionMedication } from '../../types.ts'
import { RemoveRow } from '../AddRemove.tsx'

export default function Medication({
  value,
  prefix,
  index,
  remove,
}: {
  value?: PatientConditionMedication
  prefix: string
  index: number
  remove(): void
}) {
  return (
    <RemoveRow onClick={remove} key={index} labelled>
      <DrugInput
        name={`${prefix}.medications.${index}`}
        value={value}
      />
    </RemoveRow>
  )
}
