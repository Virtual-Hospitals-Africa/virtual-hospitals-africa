import { JSX } from 'preact'
import { useSignal } from '@preact/signals'
import { PastMedicalCondition } from '../../types.ts'
import { AddRow } from '../AddRemove.tsx'
import Condition from './Condition.tsx'

export default function PastMedicalConditionsForm(props: {
  past_medical_conditions: PastMedicalCondition[]
}): JSX.Element {
  const past_medical_conditions = useSignal<
    (Partial<PastMedicalCondition> & { removed?: boolean })[]
  >(
    props.past_medical_conditions,
  )

  const addCondition = () =>
    past_medical_conditions.value = [
      ...past_medical_conditions.value,
      {},
    ]

  return (
    <div className='flex flex-col space-y-2'>
      {past_medical_conditions.value.map((state, index) =>
        !state.removed && (
          <Condition
            key={index}
            index={index}
            value={state.id
              ? props.past_medical_conditions.find(
                (condition) =>
                  condition.id === state.id &&
                  condition.start_date === state.start_date,
              )
              : undefined}
            remove={() =>
              past_medical_conditions.value = past_medical_conditions.value.map(
                (condition, j) => j === index ? { removed: true } : condition,
              )}
          />
        )
      )}
      <AddRow
        text='Add Condition'
        onClick={addCondition}
      />
    </div>
  )
}
