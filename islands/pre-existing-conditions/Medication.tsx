import MedicationInput from '../medication/Input.tsx'
import { PreExistingConditionWithDrugs } from '../../types.ts'
import { RemoveRow } from '../AddRemove.tsx'

export default function Medication({
  matchingCondition,
  condition_prefix,
  medication_id,
  medication_index,
  removeMedication,
}: {
  matchingCondition?: PreExistingConditionWithDrugs
  condition_prefix: string
  medication_id: string | number
  medication_index: number
  removeMedication(): void
}) {
  const matchingMedication = matchingCondition?.medications.find(
    (m) => m.id === medication_id,
  )
  const prefix = `${condition_prefix}.medications.${medication_index}`
  return (
    <RemoveRow onClick={removeMedication} key={medication_id} labelled>
      <MedicationInput
        name={prefix}
        value={matchingMedication}
      />
      {typeof medication_id === 'number' && (
        <input
          type='hidden'
          name={`${prefix}.id`}
          value={medication_id}
        />
      )}
    </RemoveRow>
  )
}
