import { useEffect, useState } from 'preact/hooks'
import { PlusCircleIcon } from '../components/library/icons/heroicons/outline.tsx'
import ConditionSearch from './ConditionSearch.tsx'
import { DateInput } from '../components/library/form/Inputs.tsx'
import FormRow from '../components/library/form/Row.tsx'
import RemoveIcon from '../components/library/icons/remove.tsx'

export default function ConditionsForm() {
  const [patientConditions, setPatientConditions] = useState([])

  const addCondition = () => {
    setPatientConditions([...patientConditions, {}])
  }

  const removePatientCondition = (item) => {
    setPatientConditions(patientConditions.filter((c) => c !== item))
  }

  useEffect(() => {
  })

  return (
    <div>
      {patientConditions.map((c, i) => (
        <div>
          <FormRow className='mt-1 w-full'>
            <a
              className='text-sm text-indigo-600 flex mr-5'
              onClick={() =>removePatientCondition(c)}
              href='#'
            >
              <RemoveIcon />
            </a>
            <ConditionSearch
              label='Condition name'
              name={`patient_conditions.conditions[${i}].`}
              value={c.primary_name}
            />
            <DateInput
              name={`patient_conditions.conditions[${i}].start_date`}
              label='Start Date'
              value={c.start_date}
            />
            <DateInput
              name={`patient_conditions.conditions[${i}].end_date`}
              label='End Date'
              value={c.end_date}
            />
          </FormRow>
          <div className='ml-20 mt-4'>
            <div>
              <a
                className='text-sm text-indigo-600 flex'
                onClick={addCondition}
                href='#'
              >
                <PlusCircleIcon className='h-6 w-6 flex-shrink-0 bold rounded-full' />
                Add Cormorbidity
              </a>
            </div>
            <div>
              <a
                className='text-sm text-indigo-600 flex'
                onClick={addCondition}
                href='#'
              >
                <PlusCircleIcon className='h-6 w-6 flex-shrink-0 bold rounded-full' />
                Add Medication
              </a>
            </div>
          </div>
        </div>
      ))}
      <div className='row mt-3'>
        <a
          className='text-indigo-600 flex'
          onClick={addCondition}
          href='#'
        >
          <PlusCircleIcon className='h-6 w-6 flex-shrink-0 rounded-full' />
          Add Conditions
        </a>
      </div>
    </div>
  )
}
