import { useState } from 'preact/hooks'
import { PreExistingConditionWithDrugs } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { JSX } from 'preact'
import { AddRow } from '../AddRemove.tsx'
import Condition, { ConditionState } from './Condition.tsx'

type PreExistingConditionsFormState = Map<
  string | number,
  ConditionState | { removed: true }
>

const initialState = (
  preExistingConditions: PreExistingConditionWithDrugs[] = [],
): PreExistingConditionsFormState => {
  const state = new Map()
  for (const preExistingCondition of preExistingConditions) {
    const comorbidities = preExistingCondition.comorbidities.map(({ id }) => ({
      id,
      removed: false,
    }))
    const medications = preExistingCondition.medications.map(({ id }) => ({
      id,
      removed: false,
    }))
    state.set(preExistingCondition.id, {
      comorbidities,
      medications,
      removed: false,
    })
  }
  return state
}

export default function PreExistingConditionsForm({
  preExistingConditions,
}: {
  preExistingConditions: PreExistingConditionWithDrugs[]
}): JSX.Element {
  const [patientConditions, setPatientConditions] = useState<
    PreExistingConditionsFormState
  >(
    initialState(preExistingConditions),
  )

  const addCondition = () => {
    const id = generateUUID()
    const nextPatientConditions = new Map(patientConditions)
    nextPatientConditions.set(id, {
      comorbidities: [],
      medications: [],
      removed: false,
    })
    setPatientConditions(new Map(nextPatientConditions))
  }

  return (
    <div>
      {Array.from(patientConditions.entries()).map((
        [condition_id, condition_state],
        i: number,
      ) =>
        !condition_state.removed && (
          <Condition
            condition_id={condition_id}
            condition_index={i}
            condition_state={condition_state}
            preExistingConditions={preExistingConditions}
            removeCondition={() => {
              const nextPatientConditions = new Map(patientConditions)
              nextPatientConditions.set(condition_id, {
                removed: true,
              })
              setPatientConditions(new Map(nextPatientConditions))
            }}
            updateCondition={(updatedCondition) => {
              const nextPatientConditions = new Map(patientConditions)
              nextPatientConditions.set(condition_id, updatedCondition)
              setPatientConditions(new Map(nextPatientConditions))
            }}
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
