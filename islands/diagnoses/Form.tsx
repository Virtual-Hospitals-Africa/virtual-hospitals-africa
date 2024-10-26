import { DiagnosisGroup } from '../../types.ts'
import { JSX } from 'preact'
import { AddRow } from '../AddRemove.tsx'
import DiagnosisFormRow, { DiagnosisFormRowState } from './FormRow.tsx'
import { Signal, useSignal } from '@preact/signals'

type DiagnosesFormState = Array<
  DiagnosisFormRowState | { removed: true }
>

export default function DiagnosesForm(props: {
  diagnoses: DiagnosisGroup
}): JSX.Element {
  const selfDiagnoses: Signal<DiagnosesFormState> = useSignal<
    DiagnosesFormState
  >(
    props.diagnoses.self,
  )

  const addDiagnosis = () =>
    selfDiagnoses.value = [
      ...selfDiagnoses.value,
      { comorbidities: [], medications: [] },
    ]

  const first_not_removed = selfDiagnoses.value.find(
    (d) => !d.removed,
  )

  return (
    <section className='flex flex-col gap-4'>
      <div>
        <h3 className='text-sm font-semibold text-gray-900'>
          Made by others
        </h3>
        <div className='flex flex-col gap-3'>
          {props.diagnoses.others.map((diagnoses) => (
            <p>
              {diagnoses.name} since {diagnoses.start_date}{' '}
              <span className='italic'>
                diagnosed by Dr. {diagnoses.diagnosed_by}{' '}
                {diagnoses.diagnosed_at}
              </span>
            </p>
          ))}
        </div>
      </div>
      <div className='flex flex-col gap-3'>
        <h3 className='text-sm font-semibold text-gray-900'>
          Made by you
        </h3>
        {selfDiagnoses.value.map((
          state,
          index,
        ) =>
          !state.removed && (
            <DiagnosisFormRow
              index={index}
              state={state}
              labelled={first_not_removed === state}
              value={state.id
                ? props.diagnoses.self.find(
                  (diagnosis) => diagnosis.id === state.id,
                )
                : undefined}
              remove={() =>
                selfDiagnoses.value = selfDiagnoses.value.map((diagnosis, j) =>
                  j === index ? { removed: true } : diagnosis
                )}
              update={(updatedDiagnosis) =>
                selfDiagnoses.value = selfDiagnoses.value.map((diagnosis, j) =>
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
    </section>
  )
}
