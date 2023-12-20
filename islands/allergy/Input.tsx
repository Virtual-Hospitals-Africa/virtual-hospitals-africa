import { useState } from 'preact/hooks'
import { PreExistingAllergy } from '../../types.ts'
import AllergySearch from './Search.tsx'
import { MinusCircleIcon } from '../../components/library/icons/heroicons/mini.tsx'

export default function AllergyInput({
  allergies,
}: {
  allergies: PreExistingAllergy[]
}) {
  const [selectedAllergies, setSelectedAllergies] = useState<
    PreExistingAllergy[]
  >(allergies)

  const addAllergy = (allergy: PreExistingAllergy) =>
    setSelectedAllergies([...selectedAllergies, allergy])

  const removeAllergy = (allergy: PreExistingAllergy) => {
    setSelectedAllergies(
      selectedAllergies.filter(
        (item) => item.allergy_id !== allergy.allergy_id,
      ),
    )
  }

  return (
    <div className='flex flex-col gap-1'>
      <AllergySearch
        without_ids={selectedAllergies.map(
          (allergy) => allergy.allergy_id,
        )}
        addAllergy={addAllergy}
      />
      {selectedAllergies.length > 0 && (
        <div className='flex-start flex flex-wrap gap-2 w-full'>
          {selectedAllergies.map((allergy, i) => (
            <>
              <button
                key={allergy.name}
                type='button'
                onClick={() => removeAllergy(allergy)}
                className='flex flex-row gap-2 items-center justify-between rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 h-9 p-2 cursor-pointer'
              >
                {allergy.name}
                <MinusCircleIcon className='text-indigo-600' />
              </button>
              <input
                type='hidden'
                name={`allergies.${i}.allergy_id`}
                value={allergy.allergy_id}
              />
              {allergy.id && (
                <input
                  type='hidden'
                  name={`allergies.${i}.id`}
                  value={allergy.id}
                />
              )}
            </>
          ))}
        </div>
      )}
    </div>
  )
}
