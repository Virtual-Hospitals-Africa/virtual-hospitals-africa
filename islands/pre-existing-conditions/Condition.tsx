import { PlusCircleIcon } from '../../components/library/icons/heroicons/outline.tsx'
import ConditionSearch from '../ConditionSearch.tsx'
import { DateInput } from '../../components/library/form/Inputs.tsx'
import { PreExistingConditionWithDrugs } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { JSX } from 'preact/jsx-runtime'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import Comorbidity from './Comorbidity.tsx'
import Medication from './Medication.tsx'
import FormRow from '../../components/library/form/Row.tsx'

export type ConditionState = {
  comorbidities: Set<string | number>
  medications: Set<string | number>
}

export default function Condition(
  {
    condition_id,
    condition_index,
    condition_state,
    preExistingConditions,
    removeCondition,
    updateCondition,
  }: {
    condition_id: string | number
    condition_index: number
    condition_state: ConditionState
    preExistingConditions: PreExistingConditionWithDrugs[]
    removeCondition(): void
    updateCondition(condition: ConditionState): void
  },
): JSX.Element {
  const comorbidities = Array.from(condition_state.comorbidities)
  const medications = Array.from(condition_state.medications)
  const matchingCondition = preExistingConditions.find(
    (condition) => condition.id === condition_id,
  )
  const prefix = `pre_existing_conditions.${condition_index}`

  const addComorbidity = () => {
    const id = generateUUID()
    const nextComorbidities = new Set(comorbidities)
    nextComorbidities.add(id)
    const nextConditionState = {
      medications: condition_state.medications,
      comorbidities: nextComorbidities,
    }
    updateCondition(nextConditionState)
  }

  const addMedication = () => {
    const id = generateUUID()
    const nextMedications = new Set(medications)
    nextMedications.add(id)
    const nextConditionState = {
      medications: nextMedications,
      comorbidities: condition_state.comorbidities,
    }
    updateCondition(nextConditionState)
  }

  return (
    <RemoveRow onClick={removeCondition} key={condition_id} labelled>
      <div className='flex flex-col w-full gap-2'>
        <FormRow>
          <ConditionSearch
            label='Condition name'
            name={prefix}
            value={matchingCondition}
          />
          <DateInput
            name={`${prefix}.start_date`}
            label='Start Date'
            value={matchingCondition?.start_date}
            required
          />
          {typeof condition_id === 'number' && (
            <input
              type='hidden'
              name={`${prefix}.id`}
              value={condition_id}
            />
          )}
        </FormRow>
        {comorbidities.map((
          comorbidity_id: string | number,
          comorbidity_index: number,
        ) => (
          <Comorbidity
            matchingCondition={matchingCondition}
            condition_prefix={prefix}
            comorbidity_id={comorbidity_id}
            comorbidity_index={comorbidity_index}
            removeComorbidity={() => {
              const nextComorbidities = new Set(comorbidities)
              nextComorbidities.delete(comorbidity_id)
              const nextConditionState = {
                medications: condition_state.medications,
                comorbidities: nextComorbidities,
              }
              updateCondition(nextConditionState)
            }}
          />
        ))}
        <AddRow onClick={addComorbidity} text='Add Comorbidity' />
        {medications.map((
          medication_id: string | number,
          mIndex: number,
        ) => (
          <Medication
            matchingCondition={matchingCondition}
            condition_prefix={prefix}
            medication_id={medication_id}
            medication_index={mIndex}
            removeMedication={() => {
              const nextMedications = new Set(medications)
              nextMedications.delete(medication_id)
              const nextConditionState = {
                medications: nextMedications,
                comorbidities: condition_state.comorbidities,
              }
              updateCondition(nextConditionState)
            }}
          />
        ))}
        <AddRow onClick={addMedication} text='Add Medication' labelled />
      </div>
    </RemoveRow>
  )
}
