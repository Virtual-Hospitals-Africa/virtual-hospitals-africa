import { Diagnosis, PrescriptionMedicationWithDrug } from '../../types.ts'
import { JSX } from 'preact'
import { RemoveRow } from '../AddRemove.tsx'
import { PrescriptionMedicationInput } from './MedicationInput.tsx'
import FormRow from '../form/Row.tsx'

export function PrescriptionMedicationRow(
  {
    diagnoses,
    value,
    remove,
    medicationSelected,
  }: {
    diagnoses: Diagnosis[]
    value: Partial<PrescriptionMedicationWithDrug>
    remove(): void
    medicationSelected(
      new_medication_id: string,
      values: Partial<PrescriptionMedicationWithDrug>,
    ): void
  },
): JSX.Element {
  const key = value.medication_id ?? 'new'

  const prefix = `prescriptions.${key}`

  return (
    <RemoveRow
      onClick={remove}
      key={key}
      labelled
    >
      <div className='flex flex-col w-full gap-2'>
        <FormRow>
          <PrescriptionMedicationInput
            medicationSelected={medicationSelected}
            diagnoses={diagnoses}
            value={value}
            name={prefix}
          />
        </FormRow>
      </div>
    </RemoveRow>
  )
}
