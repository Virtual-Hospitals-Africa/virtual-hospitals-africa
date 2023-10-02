// import SearchResults from '../SearchResults.tsx'
import { useCallback, useEffect, useState } from 'preact/hooks'
import SearchResults, {
  FacilitySearchResult,
} from '../components/library/SearchResults.tsx'
import { SearchInput } from '../components/library/form/Inputs.tsx'
import { assert } from 'std/assert/assert.ts'
import debounce from '../util/debounce.ts'
import { Facility, HasId, ReturnedSqlRow } from '../types.ts'

export default function FacilitySearch({
  href,
  name,
  label,
  required,
  defaultFacility,
}: {
  href: string
  name: string
  label?: string
  required?: boolean
  defaultFacility?: ReturnedSqlRow<Facility>
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [selected, setSelected] = useState<HasId<{ name: string }> | null>(null)
  const [facilities, setFacilities] = useState<
    HasId<{ name: string; address: string }>[]
  >([])

  const [search, setSearchImmediate] = useState('')

  // Don't search until the user has stopped typing for a bit
  const [setSearch] = useState({
    delay: debounce(setSearchImmediate, 220),
  })

  const onDocumentClick = useCallback(() => {
    setIsFocused(
      document.activeElement ===
        document.querySelector(`input[name="${name}_name"]`),
    )
  }, [])

  useEffect(() => {
    onDocumentClick()
    self.addEventListener('click', onDocumentClick)
    return () => self.removeEventListener('click', onDocumentClick)
  })

  useEffect(() => {
    fetch(`${href}?search=${search}`, {
      headers: { accept: 'application/json' },
    }).then(async (response) => {
      const facilities = await response.json()
      assert(Array.isArray(facilities))
      assert(
        facilities.every((facility) =>
          facility && typeof facility === 'object'
        ),
      )
      assert(
        facilities.every((facility) =>
          facility.id && typeof facility.id === 'number'
        ),
      )
      assert(
        facilities.every((facility) =>
          facility.address && typeof facility.address === 'string'
        ),
      )
      setFacilities(facilities)
    }).catch(console.error)
  }, [search])

  useEffect(() => {
    if (!defaultFacility) return
    setSearchImmediate(defaultFacility.name)
    setSelected(defaultFacility)
  }, [defaultFacility?.id])

  const showSearchResults = isFocused && facilities.length > 0 &&
    selected?.name !== search

  return (
    <div className='w-full'>
      <SearchInput
        name={`${name}_name`}
        value={search}
        required={required}
        label={label}
        onInput={(event) => {
          assert(event.target)
          assert('value' in event.target)
          assert(typeof event.target.value === 'string')
          setSearch.delay(event.target.value)
        }}
      >
        {showSearchResults && (
          <SearchResults className='max-w-sm'>
            {facilities.map((facility) => (
              <FacilitySearchResult
                facility={facility}
                isSelected={selected?.id === facility.id}
                onSelect={() => {
                  setSelected(facility)
                  setSearchImmediate(facility.name)
                }}
              />
            ))}
          </SearchResults>
        )}
      </SearchInput>

      {selected && (
        <input type='hidden' name={`${name}_id`} value={selected.id} />
      )}
    </div>
  )
}
