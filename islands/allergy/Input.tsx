import { computed, useSignal } from '@preact/signals'
import { Allergy } from '../../types.ts'
import AllergySearch from './Search.tsx'
import { MinusCircleIcon } from '../../components/library/icons/heroicons/mini.tsx'

export default function AllergyInput(props: {
  allergies: Allergy[]
  patient_allergies: Allergy[]
}) {
  const patient_allergies = useSignal(props.patient_allergies)

  const options = computed(() =>
    props.allergies.filter((a) =>
      patient_allergies.value.every((pa) => pa.id !== a.id)
    )
  )

  const add = (allergy: Allergy) =>
    patient_allergies.value = [...patient_allergies.value, allergy]

  const remove = (allergy: Allergy) =>
    patient_allergies.value = patient_allergies.value.filter((a) =>
      a.id !== allergy.id
    )

  return (
    <div className='flex flex-col gap-1'>
      <AllergySearch
        options={options.value}
        add={add}
      />
      {patient_allergies.value.length > 0 && (
        <div className='flex-start flex flex-wrap gap-2 w-full'>
          {patient_allergies.value.map((allergy, i) => (
            <>
              <button
                key={allergy.name}
                type='button'
                onClick={() => remove(allergy)}
                className='flex flex-row gap-2 items-center justify-between rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 h-9 p-2 cursor-pointer'
              >
                {allergy.name}
                <MinusCircleIcon className='text-indigo-600' />
              </button>
              <input
                type='hidden'
                name={`allergies.${i}.id`}
                value={allergy.id}
              />
            </>
          ))}
        </div>
      )}
    </div>
  )
}
