import { useCallback, useEffect, useState } from 'preact/hooks'
import SearchResults, {
  NoSearchResults,
  PersonSearchResult,
} from '../components/library/SearchResults.tsx'
import { SearchInput } from '../components/library/form/Inputs.tsx'
import { assert } from 'https://deno.land/std@0.160.0/_util/assert.ts'
import debounce from '../util/debounce.ts'
import { HasId } from '../types.ts'

type Person = HasId<{ name: string }>

export default function PersonSearch({
  href,
  name,
  required,
  label,
  value,
}: {
  href: string
  name: string
  required?: boolean
  label?: string
  value?: Person
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [selected, setSelected] = useState<Person | null>(
    value || null,
  )
  const [people, setPeople] = useState<Person[]>([])
  const [search, setSearchImmediate] = useState(value?.name || '')

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
  }, [])

  useEffect(() => {
    const url = new URL(`${window.location.origin}${href}`)
    url.searchParams.set('search', search)

    fetch(url, {
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

  const showSearchResults = isFocused && selected?.name !== search

  return (
    <div className='w-full'>
      <SearchInput
        name={`${name}_name`}
        label={label}
        value={selected?.name}
        required={required}
        onInput={(event) => {
          assert(event.target)
          assert('value' in event.target)
          assert(typeof event.target.value === 'string')
          setSelected(null)
          setSearch.delay(event.target.value)
        }}
      >
        {/* TODO add empty state for no results */}
        {showSearchResults && (
          <SearchResults>
            {people.length
              ? people.map((person) => (
                <PersonSearchResult
                  person={person}
                  isSelected={selected?.id === person.id}
                  onSelect={() => {
                    setSelected(person)
                    setSearchImmediate(person.name)
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
