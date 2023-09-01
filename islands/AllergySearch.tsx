import { useEffect, useRef, useState } from 'preact/hooks'
import { SearchInput } from '../components/library/form/Inputs.tsx'
import { allAllergies } from '../util/allergyList.ts'
import FormRow from '../components/library/form/Row.tsx'
import { assert } from 'std/_util/asserts.ts'
import SearchResults, {
  AllergySearchResult,
} from '../components/library/SearchResults.tsx'
import { RemoveIcon } from '../components/library/icons/add-remove-buttons.tsx'

export default function AllergySearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])

  const toggleAllergyList = (allergy: string) => {
    if (searchInputRef.current) {
      setSearchTerm('')
    }

    setSelectedAllergies((prevSelectedAllergies) => {
      if (prevSelectedAllergies.includes(allergy)) {
        return prevSelectedAllergies.filter((item) => item !== allergy)
      } else {
        return [...prevSelectedAllergies, allergy]
      }
    })
  }

  const filteredAllergyList = allAllergies.filter((allergy) => {
    return allergy.toLowerCase().includes(searchTerm.toLowerCase())
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        event.target instanceof Node &&
        event.target !== searchInputRef.current &&
        searchInputRef.current !== event.target
      ) {
        setTimeout(() => {
          setIsFocused(false)
        }, 150)
      }
    }

    if (isFocused) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isFocused])

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

      <FormRow className='mb-3'>
        {isFocused && searchTerm && (
          <SearchResults>
            {filteredAllergyList.map((allergy) => (
              <AllergySearchResult
                allergy={allergy}
                isSelected={false}
                onSelect={() => {
                  toggleAllergyList(allergy)
                }}
              />
            ))}
          </SearchResults>
        )}
      </FormRow>

      <div className='flex-start flex flex-row gap-2'>
        {selectedAllergies.map((allergy) => (
          <div
            key={allergy}
            onClick={() => toggleAllergyList(allergy)}
            className='flex flex-row gap-2 items-center justify-between rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 h-9 p-2'
            style={{ cursor: 'pointer' }}
          >
            {allergy}
            <RemoveIcon />
          </div>
        ))}
      </div>
    </>
  )
}
