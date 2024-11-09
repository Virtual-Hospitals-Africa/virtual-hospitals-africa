import { useSignal } from '@preact/signals'
import { Allergy } from '../../types.ts'
import AllergySearch from './Search.tsx'
import { MinusCircleIcon } from '../../components/library/icons/heroicons/mini.tsx'
import { HiddenInputs } from '../../components/library/HiddenInputs.tsx'

export default function AllergyInput(props: {
  patient_allergies: Allergy[]
}) {
  const patient_allergies = useSignal(props.patient_allergies)

  const add = (allergy: Allergy) =>
    patient_allergies.value = [...patient_allergies.value, allergy]

  const remove = (allergy: Allergy) =>
    patient_allergies.value = patient_allergies.value.filter((a) =>
      a.snomed_concept_id !== allergy.snomed_concept_id
    )

  return (
    <div className='flex flex-col gap-1'>
      <AllergySearch
        add={add}
      />
      {patient_allergies.value.length > 0 && (
        <div className='flex-start flex flex-wrap gap-2 w-full'>
          {patient_allergies.value.map((allergy, i) => (
            <>
              <HiddenInputs
                prefix={`allergies.${i}.`}
                inputs={{
                  snomed_concept_id: String(allergy.snomed_concept_id),
                  snomed_english_term: allergy.snomed_english_term,
                  patient_allergy_id: allergy.patient_allergy_id,
                }}
              />
              <button
                key={allergy.snomed_english_term}
                type='button'
                onClick={() => remove(allergy)}
                className='flex flex-row gap-2 items-center justify-between rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 h-9 p-2 cursor-pointer'
              >
                {allergy.snomed_english_term}
                <MinusCircleIcon className='text-indigo-600 w-4 h-4' />
              </button>
            </>
          ))}
        </div>
      )}
    </div>
  )
}
