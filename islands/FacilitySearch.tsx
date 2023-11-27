import { useCallback, useEffect, useState } from 'preact/hooks'
import SearchResults, {
  FacilitySearchResult,
  NoSearchResults,
} from '../components/library/SearchResults.tsx'
import { SearchInput } from '../components/library/form/Inputs.tsx'
import { assert } from 'std/assert/assert.ts'
import debounce from '../util/debounce.ts'
import { HasId } from '../types.ts'

type Facility = HasId<{ display_name: string; address: string }>

export default function FacilitySearch({
  href,
  name,
  label,
  required,
  value,
}: {
  href: string
  name: string
  label?: string
  required?: boolean
  value?: HasId<{ display_name: string }>
}) {
  const [selected, setSelected] = useState<
    HasId<{ display_name: string }> | null
  >(value || null)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [search, setSearchImmediate] = useState(value?.display_name || '')

  // Don't search until the user has stopped typing for a bit
  const [setSearch] = useState({
    delay: debounce(setSearchImmediate, 220),
  })

  const onDocumentClick = useCallback(() => {
    setIsFocused(
      document.activeElement ===
        document.querySelector(`input[name="${name}_display_name"]`),
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
      assert(
        facilities.every((facility) =>
          facility.display_name && typeof facility.display_name === 'string'
        ),
      )
      setFacilities(facilities)
    }).catch(console.error)
  }, [search])

  return (
    <div className='w-full'>
      <SearchInput
        name={`${name}_display_name`}
        value={selected?.display_name}
        required={required}
        label={label}
        onInput={(event) => {
          assert(event.target)
          assert('value' in event.target)
          assert(typeof event.target.value === 'string')
          setSelected(null)
          setSearch.delay(event.target.value)
        }}
      >
        {isFocused && (
          <SearchResults>
            {facilities.length
              ? facilities.map((facility) => (
                <FacilitySearchResult
                  facility={facility}
                  isSelected={selected?.id === facility.id}
                  onSelect={() => {
                    setSelected(facility)
                    setSearchImmediate(facility.display_name)
                    setIsFocused(false)
                  }}
                />
              ))
              : <NoSearchResults />}
          </SearchResults>
        )}
      </SearchInput>
      {selected && (
        <input type='hidden' name={`${name}_id`} value={selected.id} />
      )}
    </div>
  )
}
