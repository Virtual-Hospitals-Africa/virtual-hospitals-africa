import { useEffect, useState } from 'preact/hooks'
import { PlusCircleIcon } from '../components/library/icons/heroicons/outline.tsx'
import ConditionSearch from './ConditionSearch.tsx'
import { DateInput } from '../components/library/form/Inputs.tsx'
import FormRow from '../components/library/form/Row.tsx'
import RemoveIcon from '../components/library/icons/remove.tsx'
import MedicationSearch from './MedicationSearch.tsx'

export default function ConditionsForm() {
  const [patientConditions, setPatientConditions] = useState([])

  const addCondition = () => {
    setPatientConditions([...patientConditions, {}])
  }

  const addMedication = (condition) => {
    condition.medications = [...(condition.medications || []), {}]
    setPatientConditions([...patientConditions])
  }

  const addCormorbidity = (condition) => {
    condition.cormorbidities = [...(condition.cormorbidities || []), {}]
    setPatientConditions([...patientConditions])
  }

  const removePatientCondition = (condition) => {
    condition.removed = true
    setPatientConditions([...patientConditions])
  }

  const removeConditionMedication = (medication) => {
    medication.removed = true
    setPatientConditions([...patientConditions])
  }

  const removeConditionCormorbidity = (cormorbidity) => {
    cormorbidity.removed = true
    setPatientConditions([...patientConditions])
  }

  useEffect(() => {
  })

  return (
    <div>
      {patientConditions.map((c, i) => (!c.removed &&
        (
          <div>
            <FormRow className='mt-1 w-full'>
              <a
                className='text-sm text-indigo-600 flex mr-5'
                onClick={() => removePatientCondition(c)}
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
            <div className='pl-20 mt-4'>
              <div>
                {c.cormorbidities &&
                  c.cormorbidities.map((
                    cormorbidity,
                    cIndex,
                  ) => (!cormorbidity.removed &&
                    (
                      <FormRow className='w-full'>
                        <a
                          className='text-sm text-indigo-600 flex mr-5'
                          onClick={() =>
                            removeConditionCormorbidity(cormorbidity)}
                          href='#'
                        >
                          <RemoveIcon />
                        </a>
                        <ConditionSearch
                          label='Cormorbidity name'
                          name={`patient_conditions.conditions[${i}].cormorbidities[${cIndex}]`}
                        />
                      </FormRow>
                    ))
                  )}
                <a
                  className='text-sm text-indigo-600 flex mt-1'
                  onClick={() => addCormorbidity(c)}
                  href='#'
                >
                  <PlusCircleIcon className='h-6 w-6 flex-shrink-0 bold rounded-full' />
                  Add Cormorbidity
                </a>
              </div>
              <hr class='w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700' />
              <div>
                {c.medications &&
                  c.medications.map((medication, mIndex) => (!medication.removed &&
                    (
                      <FormRow className='w-full'>
                        <a
                          className='text-sm text-indigo-600 flex mr-5'
                          onClick={() => removeConditionMedication(medication)}
                          href='#'
                        >
                          <RemoveIcon />
                        </a>
                        <MedicationSearch
                          label='Medications'
                          name={`patient_conditions.conditions[${i}].medications[${mIndex}]`}
                          includeDoses
                          includeIntake
                        />
                      </FormRow>
                    ))
                  )}
                <a
                  className='text-sm text-indigo-600 flex mt-1'
                  onClick={() => addMedication(c)}
                  href='#'
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
