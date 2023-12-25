import { useState } from 'preact/hooks'
import { PreExistingConditionWithDrugs } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { JSX } from 'preact/jsx-runtime'
import { AddRow } from '../AddRemove.tsx'
import Condition, { ConditionState } from './Condition.tsx'

export default function PreExistingConditionsForm({
  preExistingConditions,
}: {
  preExistingConditions: PreExistingConditionWithDrugs[]
}): JSX.Element {
  const [patientConditions, setPatientConditions] = useState<
    ConditionState[]
  >(preExistingConditions)

  const addCondition = () => {
    const id = generateUUID()
    setPatientConditions([...patientConditions, {
      id,
      key_id: null,
      primary_name: null,
      start_date: null,
      medications: [],
      comorbidities: [],
    }])
  }

  return (
    <div>
      {patientConditions.map((
        condition_state,
        i: number,
      ) => (
        <Condition
          condition_id={condition_state.id}
          condition_index={i}
          condition_state={condition_state}
          preExistingConditions={preExistingConditions}
          removeCondition={() => {
            const nextPatientConditions = patientConditions.filter((c) =>
              c !== condition_state
            )
            setPatientConditions(nextPatientConditions)
          }}
          updateCondition={(updatedCondition) => {
            setPatientConditions(patientConditions.map((c) => {
              if (c === condition_state) {
                return updatedCondition
              }
              return c
            }))
          }}
        />
      ))}
      <AddRow
        text='Add Condition'
        onClick={addCondition}
      />
    </div>
  )
}
