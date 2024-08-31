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
}): JSX.Element {
  const diagnoses: Signal<DiagnosesFormState> = useSignal<DiagnosesFormState>(
    props.diagnoses,
  )

  const addDiagnosis = () =>
    diagnoses.value = [
      ...diagnoses.value,
      { comorbidities: [], medications: [] },
    ]

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
            value={state.id
              ? props.diagnoses.find(
                (diagnosis) => diagnosis.id === state.id,
              )
              : undefined}
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
