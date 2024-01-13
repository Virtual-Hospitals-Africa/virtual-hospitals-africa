import { computed, useSignal } from '@preact/signals'
import SymptomSearch from './Search.tsx'
import { MinusCircleIcon } from '../../components/library/icons/heroicons/mini.tsx'
import { SYMPTOMS } from '../../shared/symptoms.ts'
import { PatientSymptomUpsert } from '../../types.ts'

const all_symptoms_options = SYMPTOMS.map(({ symptom, category, aliases }) => ({
  id: symptom,
  name: symptom,
  category,
  aliases,
}))

export type SymptomOption = typeof all_symptoms_options[number]

export default function SymptomInput(props: {
  patient_symptoms: PatientSymptomUpsert[]
}) {
  const patient_symptoms = useSignal(props.patient_symptoms)

  const options = computed(() =>
    all_symptoms_options.filter((o) =>
      patient_symptoms.value.every((ps) => ps.symptom !== o.id)
    )
  )

  const add = (symptom: SymptomOption) =>
    patient_symptoms.value = [...patient_symptoms.value, {
      symptom: symptom.id,
      severity: 1,
      start_date: '',
      end_date: null,
      site: null,
      notes: null,
    }]

  const remove = (symptom: PatientSymptomUpsert) =>
    patient_symptoms.value = patient_symptoms.value.filter((ps) =>
      ps.symptom !== symptom.symptom
    )

  return (
    <div className='flex flex-col gap-1'>
      <SymptomSearch
        options={options.value}
        add={add}
      />
      {patient_symptoms.value.length > 0 && (
        <div className='flex-start flex flex-wrap gap-2 w-full'>
          {patient_symptoms.value.map((symptom, i) => (
            <>
              <button
                key={symptom.symptom}
                type='button'
                onClick={() => remove(symptom)}
                className='flex flex-row gap-2 items-center justify-between rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 h-9 p-2 cursor-pointer'
              >
                {symptom.symptom}
                <MinusCircleIcon className='text-indigo-600' />
              </button>
            </>
          ))}
        </div>
      )}
      <input
        type='hidden'
        name='symptoms'
        value={JSON.stringify(patient_symptoms.value)}
      />
    </div>
  )
}
