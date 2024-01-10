import { PreExistingConditionWithDrugs } from '../../types.ts'
import { JSX } from 'preact'
import { AddRow } from '../AddRemove.tsx'
import Condition, { ConditionState } from './Condition.tsx'
import { useSignal } from '@preact/signals'

type PreExistingConditionsFormState = Array<
  ConditionState | { removed: true }
>

export default function PreExistingConditionsForm({
  preExistingConditions,
}: {
  preExistingConditions: PreExistingConditionWithDrugs[]
}): JSX.Element {
  const conditions = useSignal<PreExistingConditionsFormState>(
    preExistingConditions,
  )

  const addCondition = () =>
    conditions.value = [
      ...conditions.value,
      { comorbidities: [], medications: [] },
    ]

  return (
    <div>
      {conditions.value.map((
        state,
        index,
      ) =>
        !state.removed && (
          <Condition
            index={index}
            state={state}
            value={state.id
              ? preExistingConditions.find(
                (condition) => condition.id === state.id,
              )
              : undefined}
            remove={() =>
              conditions.value = conditions.value.map((condition, j) =>
                j === index ? { removed: true } : condition
              )}
            update={(updatedCondition) =>
              conditions.value = conditions.value.map((condition, j) =>
                j === index ? updatedCondition : condition
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
