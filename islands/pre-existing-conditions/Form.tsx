import { useState } from 'preact/hooks'
import { PreExistingConditionWithDrugs } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { JSX } from 'preact/jsx-runtime'
import { AddRow } from '../AddRemove.tsx'
import Condition, { ConditionState } from './Condition.tsx'

type PreExistingConditionsFormState = Map<string | number, ConditionState>

const initialState = (
  preExistingConditions: PreExistingConditionWithDrugs[] = [],
): PreExistingConditionsFormState => {
  const state = new Map()
  for (const preExistingCondition of preExistingConditions) {
    const comorbidities = new Set()
    const medications = new Set()
    for (const comorbidity of preExistingCondition.comorbidities) {
      comorbidities.add(comorbidity.id)
    }
    for (const medication of preExistingCondition.medications) {
      medications.add(medication.id)
    }
    state.set(preExistingCondition.id, {
      comorbidities,
      medications,
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
      comorbidities: new Set(),
      medications: new Set(),
    })
    setPatientConditions(new Map(nextPatientConditions))
  }

  return (
    <div>
      {Array.from(patientConditions.entries()).map((
        [condition_id, condition_state],
        i: number,
      ) => (
        <Condition
          condition_id={condition_id}
          condition_index={i}
          condition_state={condition_state}
          preExistingConditions={preExistingConditions}
          removeCondition={() => {
            const nextPatientConditions = new Map(patientConditions)
            nextPatientConditions.delete(condition_id)
            setPatientConditions(new Map(nextPatientConditions))
          }}
          updateCondition={(updatedCondition) => {
            const nextPatientConditions = new Map(patientConditions)
            nextPatientConditions.set(condition_id, updatedCondition)
            setPatientConditions(new Map(nextPatientConditions))
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
