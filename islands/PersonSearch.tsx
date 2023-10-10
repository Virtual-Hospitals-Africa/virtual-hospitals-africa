// import SearchResults from '../SearchResults.tsx'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import SearchResults, {
  PersonSearchResult,
} from '../components/library/SearchResults.tsx'
import { SearchInput } from '../components/library/form/Inputs.tsx'
import { assert } from 'https://deno.land/std@0.160.0/_util/assert.ts'
//import { assert } from 'std/assert/assert.ts'
import debounce from '../util/debounce.ts'
import { HasId } from '../types.ts'

export default function PersonSearch({
  href,
  name,
  required,
  label,
}: { href: string; name: string; required?: boolean; label?: string }) {
  const [isFocused, setIsFocused] = useState(false)
  const [selected, setSelected] = useState<HasId<{ name: string }> | null>(null)
  const [people, setPeople] = useState<HasId<{ name: string }>[]>([])

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
      const people = await response.json()
      assert(Array.isArray(people))
      assert(people.every((person) => person && typeof person === 'object'))
      assert(
        people.every((person) => person.id && typeof person.id === 'number'),
      )
      setPeople(people)
    }).catch(console.error)
  }, [search])

  const showSearchResults = isFocused && people.length > 0 &&
    selected?.name !== search

  return (
    <div className='w-full'>
      <SearchInput
        name={`${name}_name`}
        label={label}
        value={search}
        required={required}
        onInput={(event) => {
          assert(event.target)
          assert('value' in event.target)
          assert(typeof event.target.value === 'string')
          setSearch.delay(event.target.value)
        }}
      >
        {/* TODO add empty state for no results */}
        {showSearchResults && (
          <SearchResults>
            {people.map((person) => (
              <PersonSearchResult
                person={person}
                isSelected={selected?.id === person.id}
                onSelect={() => {
                  console.log('onSelect')
                  setSelected(person)
                  setSearchImmediate(person.name)
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
