import { useState } from 'preact/hooks'
import { PlusCircleIcon } from '../components/library/icons/heroicons/outline.tsx'
import ConditionSearch from './ConditionSearch.tsx'
import { DateInput } from '../components/library/form/Inputs.tsx'
import FormRow from '../components/library/form/Row.tsx'
import RemoveIcon from '../components/library/icons/remove.tsx'
import MedicationSearch from './MedicationSearch.tsx'
import { PreExistingConditionWithDrugs } from '../types.ts'
import generateUUID from '../util/uuid.ts'
import { JSX } from 'preact/jsx-runtime'

type ConditionState = {
  comorbidities: Set<string | number>
  medications: Set<string | number>
}

type PreExistingConditionsFormState = Map<string | number, ConditionState>

const initialState = (
  preExistingConditions: PreExistingConditionWithDrugs[],
): PreExistingConditionsFormState => {
  if (!preExistingConditions?.length) {
    return new Map()
  }
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

function Comorbidity({
  matchingCondition,
  condition_prefix,
  comorbidity_id,
  comorbidity_index,
  removeComorbidity,
}: {
  matchingCondition?: PreExistingConditionWithDrugs
  condition_prefix: string
  comorbidity_id: string | number
  comorbidity_index: number
  removeComorbidity(): void
}): JSX.Element {
  const matchingComorbidity = matchingCondition?.comorbidities.find(
    (c) => c.id === comorbidity_id,
  )
  const prefix = `${condition_prefix}.comorbidities.${comorbidity_index}`
  return (
    <FormRow className='w-full mt-1' key={comorbidity_id}>
      <a
        className='text-sm text-indigo-600 flex mr-5 cursor-pointer items-center'
        onClick={removeComorbidity}
      >
        <RemoveIcon />
      </a>
      <ConditionSearch
        label={null}
        name={prefix}
        value={matchingComorbidity}
      />
      <DateInput
        name={`${prefix}.start_date`}
        label={null}
        value={matchingComorbidity?.start_date}
      />
      {typeof comorbidity_id === 'number' && (
        <input
          type='hidden'
          name={`${prefix}.id`}
          value={comorbidity_id}
        />
      )}
    </FormRow>
  )
}

function Medication({
  matchingCondition,
  condition_prefix,
  medication_id,
  medication_index,
  removeMedication,
}: {
  matchingCondition?: PreExistingConditionWithDrugs
  condition_prefix: string
  medication_id: string | number
  medication_index: number
  removeMedication(): void
}) {
  const matchingMedication = matchingCondition?.medications.find(
    (m) => m.id === medication_id,
  )
  const prefix = `${condition_prefix}.medications.${medication_index}`
  return (
    <FormRow className='w-full mt-1' key={medication_id}>
      <a
        className='text-sm text-indigo-600 flex mr-5 cursor-pointer items-center'
        onClick={removeMedication}
      >
        <RemoveIcon />
      </a>
      <MedicationSearch
        name={prefix}
        value={matchingMedication}
      />
      {typeof medication_id === 'number' && (
        <input
          type='hidden'
          name={`${prefix}.id`}
          value={medication_id}
        />
      )}
    </FormRow>
  )
}

function Condition(
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
    <div key={condition_id}>
      <FormRow className='mt-1 w-full'>
        <a
          className='text-sm text-indigo-600 flex mr-5 cursor-pointer'
          onClick={removeCondition}
        >
          <RemoveIcon />
        </a>
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
      <div className='pl-20 mt-4'>
        <div>
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
          <a
            className='text-sm text-indigo-600 flex mt-1 cursor-pointer'
            onClick={addComorbidity}
          >
            <PlusCircleIcon className='h-6 w-6 flex-shrink-0 bold rounded-full items-center mr-5' />
            Add Comorbidity
          </a>
        </div>
        <hr class='w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700' />
        <div>
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
          <a
            className='text-sm text-indigo-600 flex mt-1 cursor-pointer'
            onClick={addMedication}
          >
            <PlusCircleIcon className='h-6 w-6 flex-shrink-0 bold rounded-full items-center mr-5' />
            Add Medication
          </a>
        </div>
      </div>
    </div>
  )
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
      <div className='row mt-3'>
        <a
          className='text-indigo-600 flex cursor-pointer'
          onClick={addCondition}
        >
          <PlusCircleIcon className='h-6 w-6 flex-shrink-0 rounded-full mr-5' />
          Add Condition
        </a>
      </div>
    </div>
  )
}
