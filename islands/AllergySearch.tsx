import { useEffect, useRef, useState } from 'preact/hooks'
import { SearchInput } from '../components/library/form/Inputs.tsx'
import { allAllergies } from '../util/allergyList.ts'
import FormRow from '../components/library/form/Row.tsx'
import { assert } from 'std/assert/assert.ts'
import SearchResults, {
  AllergySearchResult,
} from '../components/library/SearchResults.tsx'
import RemoveIcon from '../components/library/icons/remove.tsx'

export default function AllergySearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])

  const toggleAllergyList = (allergy: string) => {
    if (searchInputRef.current) {
      setSearchTerm('')
    }

    setSelectedAllergies((prevSelectedAllergies) =>
      prevSelectedAllergies.includes(allergy)
        ? prevSelectedAllergies.filter((item) => item !== allergy)
        : [...prevSelectedAllergies, allergy]
    )
  }

  const filteredAllergyList = allAllergies
    .filter((allergy) => !selectedAllergies.includes(allergy))
    .filter((allergy) =>
      allergy.toLowerCase().includes(searchTerm.toLowerCase())
    )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchInputRef.current &&
        event.target instanceof Node &&
        event.target !== searchInputRef.current &&
        searchInputRef.current !== event.target
      ) {
        setIsFocused(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <>
      <FormRow>
        <SearchInput
          label=''
          placeholder={'Search for allergies'}
          value={searchTerm}
          onInput={(e) => {
            assert(e.target)
            assert('value' in e.target)
            assert(typeof e.target.value === 'string')
            setSearchTerm(e.target.value)
            setIsFocused(true)
          }}
          onFocus={() => setIsFocused(true)}
          ref={searchInputRef}
        />
      </FormRow>

      <FormRow className='mb-3 relative'>
        {isFocused && searchTerm && !!filteredAllergyList.length && (
          <SearchResults>
            {filteredAllergyList.map((allergy) => (
              <AllergySearchResult
                allergy={allergy}
                onSelect={() => toggleAllergyList(allergy)}
              />
            ))}
          </SearchResults>
        )}
      </FormRow>

      <div className='flex-start flex flex-wrap gap-2 w-full'>
        {selectedAllergies.map((allergy) => (
          <button
            key={allergy}
            onClick={() => toggleAllergyList(allergy)}
            className='flex flex-row gap-2 items-center justify-between rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 h-9 p-2 cursor-pointer'
          >
            {allergy}
            <RemoveIcon />
          </button>
        ))}
      </div>
    </>
  )
}
