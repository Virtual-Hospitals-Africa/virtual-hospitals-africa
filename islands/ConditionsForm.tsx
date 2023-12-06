// deno-lint-ignore-file no-explicit-any
import { useEffect, useState } from 'preact/hooks'
import { PlusCircleIcon } from '../components/library/icons/heroicons/outline.tsx'
import ConditionSearch from './ConditionSearch.tsx'
import { DateInput } from '../components/library/form/Inputs.tsx'
import FormRow from '../components/library/form/Row.tsx'
import RemoveIcon from '../components/library/icons/remove.tsx'
import MedicationSearch from './MedicationSearch.tsx'

export default function ConditionsForm({
  conditions,
}: {
  conditions?: any
}) {
  const [patientConditions, setPatientConditions] = useState<any>([])

  const addCondition = () => {
    setPatientConditions([...patientConditions, {}])
  }

  const addMedication = (condition: any) => {
    condition.medications = [...(condition.medications || []), {}]
    setPatientConditions([...patientConditions])
  }

  const addComorbidity = (condition: any) => {
    condition.comorbidities = [...(condition.comorbidities || []), {}]
    setPatientConditions([...patientConditions])
  }

  const removePatientCondition = (condition: any) => {
    condition.removed = true
    setPatientConditions([...patientConditions])
  }

  const removeConditionMedication = (medication: any) => {
    medication.removed = true
    setPatientConditions([...patientConditions])
  }

  const removeConditionComorbidity = (comorbidity: any) => {
    comorbidity.removed = true
    setPatientConditions([...patientConditions])
  }

  useEffect(() => {
  })

  return (
    <div>
      {patientConditions.map((c: any, i: number) => (!c.removed &&
        (
          <div>
            <FormRow className='mt-1 w-full'>
              <a
                className='text-sm text-indigo-600 flex mr-5 cursor-pointer'
                onClick={() => removePatientCondition(c)}
              >
                <RemoveIcon />
              </a>
              <ConditionSearch
                label='Condition name'
                name={`conditions.${i}.`}
                value={c.primary_name}
              />
              <DateInput
                name={`conditions.${i}.start_date`}
                label='Start Date'
                value={c.start_date}
              />
              <DateInput
                name={`conditions.${i}.end_date`}
                label='End Date'
                value={c.end_date}
              />
            </FormRow>
            <div className='pl-20 mt-4'>
              <div>
                {c.comorbidities &&
                  c.comorbidities.map((
                    comorbidity: any,
                    cIndex: number,
                  ) => (!comorbidity.removed &&
                    (
                      <FormRow className='w-full'>
                        <a
                          className='text-sm text-indigo-600 flex mr-5 cursor-pointer'
                          onClick={() =>
                            removeConditionComorbidity(comorbidity)}
                        >
                          <RemoveIcon />
                        </a>
                        <ConditionSearch
                          label='Comorbidity name'
                          name={`conditions.${i}.comorbidities.${cIndex}`}
                        />
                        <input
                          type='hidden'
                          name={`conditions.${i}.comorbidities.${cIndex}`}
                          value={comorbidity.id}
                        />
                      </FormRow>
                    ))
                  )}
                <a
                  className='text-sm text-indigo-600 flex mt-1 cursor-pointer'
                  onClick={() => addComorbidity(c)}
                >
                  <PlusCircleIcon className='h-6 w-6 flex-shrink-0 bold rounded-full' />
                  Add Comorbidity
                </a>
              </div>
              <hr class='w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700' />
              <div>
                {c.medications &&
                  c.medications.map((
                    medication: any,
                    mIndex: number,
                  ) => (!medication.removed &&
                    (
                      <FormRow className='w-full'>
                        <a
                          className='text-sm text-indigo-600 flex mr-5 cursor-pointer'
                          onClick={() => removeConditionMedication(medication)}
                        >
                          <RemoveIcon />
                        </a>
                        <MedicationSearch
                          label='Medications'
                          name={`conditions.${i}.medications.${mIndex}`}
                          includeDoses
                          includeIntake
                        />
                      </FormRow>
                    ))
                  )}
                <a
                  className='text-sm text-indigo-600 flex mt-1 cursor-pointer'
                  onClick={() => addMedication(c)}
                >
                  <PlusCircleIcon className='h-6 w-6 flex-shrink-0 bold rounded-full' />
                  Add Medication
                </a>
              </div>
            </div>
          </div>
        ))
      )}
      <div className='row mt-3'>
        <a
          className='text-indigo-600 flex cursor-pointer'
          onClick={addCondition}
        >
          <PlusCircleIcon className='h-6 w-6 flex-shrink-0 rounded-full' />
          Add Conditions
        </a>
      </div>
    </div>
  )
}
