import ConditionSearch from '../ConditionSearch.tsx'
import { DateInput } from '../../components/library/form/Inputs.tsx'
import { PreExistingConditionWithDrugs } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { JSX } from 'preact'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import Comorbidity from './Comorbidity.tsx'
import Medication from './Medication.tsx'
import FormRow from '../../components/library/form/Row.tsx'

export type ConditionState = {
  removed: false
  comorbidities: Array<
    { id: string | number; removed: false } | { removed: true }
  >
  medications: Array<
    { id: string | number; removed: false } | { removed: true }
  >
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
    const nextComorbidities = [...comorbidities, { id, removed: false }]
    const nextConditionState = {
      medications: condition_state.medications,
      comorbidities: nextComorbidities,
      removed: false as const,
    }
    updateCondition(nextConditionState)
  }

  const addMedication = () => {
    const id = generateUUID()
    const nextMedications = [...medications, { id, removed: false }]
    const nextConditionState = {
      medications: nextMedications,
      comorbidities: condition_state.comorbidities,
      removed: false as const,
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
          comorbidity,
          comorbidity_index,
        ) =>
          !comorbidity.removed && (
            <Comorbidity
              matchingCondition={matchingCondition}
              condition_prefix={prefix}
              comorbidity_id={comorbidity.id}
              comorbidity_index={comorbidity_index}
              removeComorbidity={() => {
                const nextComorbidities = comorbidities.map((c) =>
                  c === comorbidity ? { removed: true as const } : c
                )
                const nextConditionState = {
                  medications: condition_state.medications,
                  comorbidities: nextComorbidities,
                  removed: false as const,
                }
                updateCondition(nextConditionState)
              }}
            />
          )
        )}
        <AddRow onClick={addComorbidity} text='Add Comorbidity' />
        {medications.map((
          medication,
          medication_index,
        ) =>
          !medication.removed && (
            <Medication
              matchingCondition={matchingCondition}
              condition_prefix={prefix}
              medication_id={medication.id}
              medication_index={medication_index}
              removeMedication={() => {
                const nextMedications = medications.map((m) =>
                  m === medication ? { removed: true as const } : m
                )
                const nextConditionState = {
                  medications: nextMedications,
                  comorbidities: condition_state.comorbidities,
                  removed: false as const,
                }
                updateCondition(nextConditionState)
              }}
            />
          )
        )}
        <AddRow onClick={addMedication} text='Add Medication' labelled />
      </div>
    </RemoveRow>
  )
}
