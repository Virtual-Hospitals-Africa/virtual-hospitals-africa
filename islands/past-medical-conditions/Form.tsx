import { useState } from 'preact/hooks'
import { PastMedicalCondition } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { JSX } from 'preact/jsx-runtime'
import { AddRow } from '../AddRemove.tsx'
import Condition, { ConditionState } from './Condition.tsx'

type pastConditionsFormState = Map<
  string | number,
  ConditionState | { removed: true }
>

const initialState = (
  pastMedicalConditions: PastMedicalCondition[] = [],
): pastConditionsFormState => {
  const state = new Map()
  for (const pastMedicalCondition of pastMedicalConditions) {
    state.set(pastMedicalCondition.id, {
      removed: false,
    })
  }
  return state
}

export default function PastMedicalConditionsForm({
  pastMedicalConditions,
}: {
  pastMedicalConditions: PastMedicalCondition[]
}): JSX.Element {
  const [patientConditions, setPatientConditions] = useState<
    pastConditionsFormState
  >(
    initialState(pastMedicalConditions),
  )

  const addCondition = () => {
    const id = generateUUID()
    const nextPatientConditions = new Map(patientConditions)
    nextPatientConditions.set(id, {
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
            pastMedicalConditions={pastMedicalConditions}
            removeCondition={() => {
              const nextPatientConditions = new Map(patientConditions)
              nextPatientConditions.set(condition_id, {
                removed: true,
              })
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
