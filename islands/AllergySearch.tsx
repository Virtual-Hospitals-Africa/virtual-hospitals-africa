import { useCallback, useEffect, useState } from 'preact/hooks'
import { SearchInput } from '../components/library/form/Inputs.tsx'
import FormRow from '../components/library/form/Row.tsx'
import { assert } from 'std/assert/assert.ts'
import SearchResults, {
  AllergySearchResult,
} from '../components/library/SearchResults.tsx'
import debounce from '../util/debounce.ts'
import RemoveIcon from '../components/library/icons/remove.tsx'
import { Allergy, PreExistingAllergy } from '../types.ts'

export default function AllergySearch({
  name,
  value,
}: {
  name: string
  value?: PreExistingAllergy[]
}) {
  const [shouldSetInitiallySelected, setShouldSetInitiallySelected] = useState(
    !!value,
  )
  const [search, setSearchImmediate] = useState('')
  const [setSearch] = useState({
    delay: debounce(setSearchImmediate, 220),
  })
  const [isFocused, setIsFocused] = useState(false)

  const [selectedAllergies, setSelectedAllergies] = useState<
    PreExistingAllergy[]
  >([])
  const [allergies, setAllergies] = useState<Allergy[]>([])

  const addAllergy = (allergy: PreExistingAllergy) => {
    const allergyExist = selectedAllergies.find((c) => c.allergy_id === allergy.allergy_id)
    if (allergyExist) {
      allergyExist.removed = false
      return
    }
    setSelectedAllergies([...selectedAllergies, allergy])
  }

  const removeAllergy = (allergy: PreExistingAllergy) => {
    if (allergy.id) {
      allergy.removed = true
      setSelectedAllergies(selectedAllergies.map(item => (item.id === allergy.id ? { ...item, allergy } : item)))
    } else {
      setSelectedAllergies(selectedAllergies.filter((item) => item !== allergy))
    }
  }

  const getAllergies = async () => {
    const url = new URL(`${window.location.origin}/app/allergies`)
    url.searchParams.set('search', search)

    await fetch(url, {
      headers: { accept: 'application/json' },
    }).then(async (response) => {
      const allergiesList = await response.json()
      assert(Array.isArray(allergiesList))
      setAllergies(allergiesList)

      if (shouldSetInitiallySelected && value && value?.length > 0) {
        const selected = value.map((c) => ({
          id: c.id,
          allergy_id: c.allergy_id,
          name: allergiesList.find((d) => d.id === c.allergy_id)?.name,
        }))
        setSelectedAllergies(selected)
        setShouldSetInitiallySelected(false)
      }
    }).catch(console.error)
  }

  useEffect(() => {
    getAllergies()
  }, [search, selectedAllergies])

  const onDocumentClick = useCallback(() => {
    setIsFocused(
      document.activeElement ===
        document.querySelector(`input[name="${name}.search"]`),
    )
  }, [])

  useEffect(() => {
    onDocumentClick()
    self.addEventListener('click', onDocumentClick)
    return () => self.removeEventListener('click', onDocumentClick)
  })

  return (
    <>
      <FormRow>
        <SearchInput
          name={`${name}.search`}
          label='Allergies'
          value={search}
          onInput={(event) => {
            assert(event.target)
            assert('value' in event.target)
            assert(typeof event.target.value === 'string')
            setSearch.delay(event.target.value)
          }}
        />
      </FormRow>

      <FormRow className='mb-3 relative'>
        {isFocused && search && allergies.length > 0 && (
          <SearchResults>
            {allergies.map((allergy) => (
              <AllergySearchResult
                allergy={allergy.name}
                isSelected={selectedAllergies?.some((c) => c.id === allergy.id)}
                onSelect={() => {
                  addAllergy({ allergy_id: allergy.id, name: allergy.name })
                  setSearchImmediate('')
                }}
              />
            ))}
          </SearchResults>
        )}
      </FormRow>

      <div className='flex-start flex flex-wrap gap-2 w-full'>
        {selectedAllergies.map((allergy, i) => (
          <>
            {!allergy.removed
              ? (
                <>
                  <button
                    key={allergy.name}
                    type='button'
                    onClick={() => removeAllergy(allergy)}
                    className='flex flex-row gap-2 items-center justify-between rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 h-9 p-2 cursor-pointer'
                  >
                    {allergy.name}
                    <RemoveIcon />
                  </button>
                  <input
                    type='hidden'
                    name={`${name}.${i}.allergy_id`}
                    value={allergy.allergy_id}
                  />
                  <input
                    type='hidden'
                    name={`${name}.${i}.id`}
                    value={allergy?.id ?? undefined}
                  />
                </>
              )
              : allergy.id && (
                <>
                  <input
                    type='hidden'
                    name={`${name}.${i}.id`}
                    value={allergy.id}
                  />
                  <input
                    type='hidden'
                    name={`${name}.${i}.allergy_id`}
                    value={allergy.allergy_id}
                  />
                  <input
                    type='hidden'
                    name={`${name}.${i}.removed`}
                    value='true'
                  />
                </>
              )}
          </>
        ))}
      </div>
    </>
  )
}
