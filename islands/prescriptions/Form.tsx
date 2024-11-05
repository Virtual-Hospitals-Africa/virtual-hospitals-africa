import { Diagnosis, PrescriptionMedicationWithDrug } from '../../types.ts'
import { JSX } from 'preact'
import { AddRow } from '../AddRemove.tsx'
import { PrescriptionMedicationRow } from './MedicationRow.tsx'
import { useSignal } from '@preact/signals'
import { groupByUniq } from '../../util/groupBy.ts'

export default function PrescriptionsForm({
  diagnoses,
  medications,
}: {
  diagnoses: Diagnosis[]
  medications: PrescriptionMedicationWithDrug[]
}): JSX.Element {
  const adding_new_prescription = useSignal(false)

  const prescriptions = useSignal<
    Map<string, Partial<PrescriptionMedicationWithDrug>>
  >(groupByUniq(medications, 'medication_id'))

  const addPrescription = () => {
    if (adding_new_prescription.value) {
      return alert('Please complete the current prescription first.')
    }
    adding_new_prescription.value = true
  }

  console.log('diagnoses', diagnoses)

  return (
    <div>
      {Array.from(prescriptions.value.entries()).map(([
        medication_id,
        prescription,
      ]) => (
        <PrescriptionMedicationRow
          key={medication_id}
          diagnoses={diagnoses}
          value={prescription}
          remove={() => {
            const next_prescriptions = new Map(prescriptions.value)
            next_prescriptions.delete(medication_id)
            prescriptions.value = next_prescriptions
          }}
          medicationSelected={(
            new_medication_id: string,
            values: Partial<PrescriptionMedicationWithDrug>,
          ) => {
            const next_prescriptions = new Map(prescriptions.value)
            next_prescriptions.delete(medication_id)
            next_prescriptions.set(new_medication_id, values)
            prescriptions.value = next_prescriptions
          }}
        />
      ))}
      {adding_new_prescription.value && (
        <PrescriptionMedicationRow
          key='new'
          diagnoses={diagnoses}
          value={{}}
          remove={() => {
            adding_new_prescription.value = false
          }}
          medicationSelected={(
            new_medication_id: string,
            values: Partial<PrescriptionMedicationWithDrug>,
          ) => {
            adding_new_prescription.value = false
            const next_prescriptions = new Map(prescriptions.value)
            next_prescriptions.set(new_medication_id, values)
            prescriptions.value = next_prescriptions
          }}
        />
      )}
      <AddRow
        text='Add Prescription'
        onClick={addPrescription}
      />
    </div>
  )
}
