import { Diagnosis } from '../../types.ts'
import { JSX } from 'preact'
import { AddRow } from '../AddRemove.tsx'
import DiagnosisFormRow, { DiagnosisFormRowState } from './FormRow.tsx'
import { Signal, useSignal } from '@preact/signals'

type DiagnosesFormState = Array<
  DiagnosisFormRowState | { removed: true }
>

export default function DiagnosesForm(props: {
  diagnoses: Diagnosis[]
  earliestSymptomDate?: string
}): JSX.Element {
  const diagnoses: Signal<DiagnosesFormState> = useSignal<DiagnosesFormState>(
    props.diagnoses,
  )

  const addDiagnosis = () => {
    const newDiagnosis = {
      comorbidities: [],
      medications: [],
      start_date: props.earliestSymptomDate ||
        new Date().toISOString().split('T')[0], // default to earliest date or today
    }

    diagnoses.value = [...diagnoses.value, newDiagnosis]
  }

  const first_not_removed = diagnoses.value.find(
    (d) => !d.removed,
  )

  return (
    <div>
      {diagnoses.value.map((
        state,
        index,
      ) =>
        !state.removed && (
          <DiagnosisFormRow
            index={index}
            state={state}
            labelled={first_not_removed === state}
            value={state.id
              ? props.diagnoses.find(
                (diagnosis) => diagnosis.id === state.id,
              )
              : undefined}
            earliestSymptomDate={props.earliestSymptomDate}
            remove={() =>
              diagnoses.value = diagnoses.value.map((diagnosis, j) =>
                j === index ? { removed: true } : diagnosis
              )}
            update={(updatedDiagnosis) =>
              diagnoses.value = diagnoses.value.map((diagnosis, j) =>
                j === index ? updatedDiagnosis : diagnosis
              )}
          />
        )
      )}
      <AddRow
        text='Add Diagnosis'
        onClick={addDiagnosis}
      />
    </div>
  )
}
