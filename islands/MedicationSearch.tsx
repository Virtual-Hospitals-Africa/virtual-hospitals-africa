import { useEffect, useRef, useState } from 'preact/hooks'
import { SearchInput } from '../components/library/form/Inputs.tsx'
import FormRow from '../components/library/form/Row.tsx'
import { assert } from 'std/assert/assert.ts'
import SearchResults from '../components/library/SearchResults.tsx'
import RemoveIcon from '../components/library/icons/remove.tsx'
import { Medication } from '../types.ts'

export default function MedicationSearch() {
  const [search, setSearch] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const [selectedMedications, setSelectedMedications] = useState<string[]>([])
  const [medications, setMedications] = useState<Medication[]>([])

  const toggleMedsList = (med: string) => {
    if (searchInputRef.current) {
      setSearch('')
    }

    setSelectedMedications((prevSelected) =>
      prevSelected.includes(med)
        ? prevSelected.filter((item) => item !== med)
        : [...prevSelected, med]
    )
  }

  const filteredMedicationsList = medications.map((m) => m.generic_name)
    .filter((med) => !selectedMedications.includes(med))
    .filter((med) => med.toLowerCase().includes(search.toLowerCase()))

  const getMedications = async () => {
    const url = new URL(`${window.location.origin}/app/medications`)
    url.searchParams.set('search', search)

    fetch(url, {
      headers: { accept: 'application/json' },
    }).then(async (response) => {
      const meds = await response.json()
      assert(Array.isArray(meds))
      setMedications(meds)
    }).catch(console.error)
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
      getMedications()
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <>
      <FormRow>
        <SearchInput
          label=''
          placeholder='Search for medications'
          value={search}
          onInput={(e) => {
            assert(e.target)
            assert('value' in e.target)
            assert(typeof e.target.value === 'string')
            setSearch(e.target.value)
            setIsFocused(true)
          }}
          onFocus={() => setIsFocused(true)}
          ref={searchInputRef}
        />
      </FormRow>

      <FormRow className='mb-3 relative'>
        {isFocused && search && !!filteredMedicationsList.length && (
          <SearchResults>
            {filteredMedicationsList.map((med) => <div>{med}</div>)}
          </SearchResults>
        )}
      </FormRow>

      <div className='flex-start flex flex-wrap gap-2 w-full'>
        {selectedMedications.map((med) => (
          <button
            key={med}
            onClick={() => toggleMedsList(med)}
            className='flex flex-row gap-2 items-center justify-between rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 h-9 p-2 cursor-pointer'
          >
            {med}
            <RemoveIcon />
          </button>
        ))}
      </div>
    </>
  )
}
