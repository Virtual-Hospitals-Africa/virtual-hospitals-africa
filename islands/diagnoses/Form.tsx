import { DiagnosisGroup, Maybe } from '../../types.ts'
import { JSX } from 'preact'
import { AddRow } from '../AddRemove.tsx'
import DiagnosisFormRow, { DiagnosisFormRowState } from './FormRow.tsx'
import { Signal, useSignal } from '@preact/signals'
import { AgreeDisagreeQuestion } from '../../islands/form/Inputs.tsx'

type SelfDiagnosesFormState = Array<
  DiagnosisFormRowState | { removed: true }
>

type OthersDiagnosesFormState = Array<
  {
    id?: string
    diagnosis_id?: string
    approval?: Maybe<'agree' | 'disagree'>
  }
>

export default function DiagnosesForm(props: {
  diagnoses: DiagnosisGroup
  earliestSymptomDate?: string
}): JSX.Element {
  const selfDiagnoses: Signal<SelfDiagnosesFormState> = useSignal<
    SelfDiagnosesFormState
  >(
    props.diagnoses.self,
  )

  const othersDiagnoses: Signal<OthersDiagnosesFormState> = useSignal<
    OthersDiagnosesFormState
  >(
    props.diagnoses.others,
  )

  const addDiagnosis = () => {
    const newDiagnosis = {
      comorbidities: [],
      medications: [],
      start_date: props.earliestSymptomDate ||
        new Date().toISOString().split('T')[0], // default to earliest date or today
    }

    selfDiagnoses.value = [...selfDiagnoses.value, newDiagnosis]
  }

  const first_not_removed = selfDiagnoses.value.find(
    (d) => !d.removed,
  )

  return (
    <section className='flex flex-col gap-4'>
      {othersDiagnoses.value.length > 0 && (
        <div>
          <h3 className='text-sm font-semibold text-gray-900'>
            Made by others
          </h3>
          <div className='flex flex-col gap-3'>
            {othersDiagnoses.value.map((state, index) => {
              return (
                <div className='flex items-center gap-2' key={index}>
                  <AgreeDisagreeQuestion
                    name={`diagnoses_collaborations.${index}.approval`}
                    onChange={(approval) => {
                      othersDiagnoses.value = othersDiagnoses.value.map((
                        diagnosis,
                        j,
                      ) => j === index ? { ...diagnosis, approval } : diagnosis)
                    }}
                    value={state.id
                      ? othersDiagnoses.value.find((od) => od.id === state.id)
                        ?.approval
                      : null}
                  />
                  <input
                    type='hidden'
                    name={`diagnoses_collaborations.${index}.diagnosis_id`}
                    value={state.diagnosis_id}
                  />
                  <p>
                    {props.diagnoses.others[index].name} since{' '}
                    {props.diagnoses.others[index].start_date}{' '}
                    <span className='italic'>
                      diagnosed by Dr.{' '}
                      {props.diagnoses.others[index].diagnosed_by}{' '}
                      {props.diagnoses.others[index].diagnosed_at}
                    </span>
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
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
              earliestSymptomDate={props.earliestSymptomDate}
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
