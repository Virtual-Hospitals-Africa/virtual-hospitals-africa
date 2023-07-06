// import SearchResults from '../SearchResults.tsx'
import { useEffect, useState } from 'preact/hooks'
import SearchResults, {
  PersonSearchResult,
} from '../components/library/SearchResults.tsx'
import { SearchInput } from '../components/library/form/Inputs.tsx'
import { assert } from 'std/testing/asserts.ts'
import debounce from '../util/debounce.ts'
import { HasId } from '../types.ts'

export default function PersonSearch({
  href,
  name,
}: { href: string; name: string }) {
  const [isFocused, setIsFocused] = useState(false)
  const [selected, setSelected] = useState<HasId<{ name: string }> | null>(null)
  const [people, setPeople] = useState<HasId<{ name: string }>[]>([])

  const [search, setSearchImmediate] = useState('')

  // Don't search until the user has stopped typing for a bit
  const [setSearch] = useState({
    delay: debounce(setSearchImmediate, 220),
  })

  useEffect(() => {
    fetch(`${href}?search=${search}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (response) => {
      const people = await response.json()
      assert(Array.isArray(people))
      assert(people.every((person) => person && typeof person === 'object'))
      assert(
        people.every((person) => person.id && typeof person.id === 'number'),
      )
      setPeople(people)
    })
  }, [search])

  console.log('search', search)
  console.log('isFocused', isFocused)
  console.log('people', people)
  console.log('selected', selected)

  // const showSearchResults = isFocused && people.length > 0 &&
  //   selected?.name !== search

  const showSearchResults = true

  console.log('showSearchResults', showSearchResults)

  return (
    <>
      <SearchInput
        onFocus={() => {
          console.log('setIsFocused(true)')
          setIsFocused(true)
        }}
        onBlur={() => {
          console.log('setIsFocused(false)')
          setIsFocused(false)
        }}
        name={name}
        value={search}
        onInput={(event) => {
          assert(event.target)
          assert('value' in event.target)
          assert(typeof event.target.value === 'string')
          setSearch.delay(event.target.value)
        }}
      />
      {/* TODO add empty state for no results */}
      {showSearchResults && (
        <SearchResults>
          {people.map((person) => (
            <PersonSearchResult
              person={person}
              isSelected={selected?.id === person.id}
              onSelect={() => {
                setSelected(person)
                setSearchImmediate(person.name)
              }}
            />
          ))}
        </SearchResults>
      )}
    </>
  )
}
