import { useEffect, useRef, useState } from 'preact/hooks'
import { SearchInput } from '../components/library/form/Inputs.tsx'
import FormRow from '../components/library/form/Row.tsx'
import { assert } from 'std/assert/assert.ts'
import SearchResults, {
  ConditionSearchResult,
} from '../components/library/SearchResults.tsx'
import RemoveIcon from '../components/library/icons/remove.tsx'
import MedicationSearch from './MedicationSearch.tsx'

export default function ConditionSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [results, setResults] = useState<null | [string, string][]>(null)
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])

  const handleSearch = async (query: string) => {
    try {
      const response = await fetch(
        `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=${
          encodeURIComponent(query)
        }&df=primary_name,term_icd9_code`,
      )
      const data = await response.json()
      setResults(data[3])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const toggleConditionList = (condition: string) => {
    if (searchInputRef.current) {
      setSearchTerm('')
    }

    setSelectedConditions((prevSelectedConditions) =>
      prevSelectedConditions.includes(condition)
        ? prevSelectedConditions.filter((item) => item !== condition)
        : [...prevSelectedConditions, condition]
    )
  }

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
          placeholder='Search for conditions'
          value={searchTerm}
          onInput={(e) => {
            assert(e.target)
            assert('value' in e.target)
            assert(typeof e.target.value === 'string')
            setSearchTerm(e.target.value)
            setIsFocused(true)
            handleSearch(e.target.value)
          }}
          onFocus={() => setIsFocused(true)}
          ref={searchInputRef}
        />
      </FormRow>
       
      <MedicationSearch name='advil' label='blah' includeDoses includeIntake/> //to be done

      <FormRow className='mb-3 relative'>
        {isFocused && searchTerm && results?.length && (
          <SearchResults>
            {results.map((condition) => (
              <ConditionSearchResult
                condition={condition[0]}
                onSelect={() => toggleConditionList(condition[0])}
              />
            ))}
          </SearchResults>
        )}
      </FormRow>
      <div className='flex-start flex flex-wrap gap-2 w-full'>
        {selectedConditions.map((condition) => (
          <button
            key={condition}
            onClick={() => toggleConditionList(condition)}
            className='flex flex-row gap-2 items-center justify-between rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 h-9 p-2 cursor-pointer'
          >
            {condition}
            <RemoveIcon />
          </button>
        ))}
      </div>
    </>
  )
}

// export default function test () {
//   return (
//     <button onClick={ConditionSearch}>hello this is a button</button>
//   )
// }
