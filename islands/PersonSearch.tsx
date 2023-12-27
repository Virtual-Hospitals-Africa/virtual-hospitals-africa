import { useCallback, useEffect, useState } from 'preact/hooks'
import SearchResults, {
  AddButtonSearchResult,
  PersonSearchResult,
} from '../components/library/SearchResults.tsx'
import { SearchInput } from '../components/library/form/Inputs.tsx'
import { assert } from 'std/assert/assert.ts'
import debounce from '../util/debounce.ts'
import { HasId } from '../types.ts'
import isObjectLike from '../util/isObjectLike.ts'

function hasId(value: unknown): value is HasId {
  return isObjectLike(value) && typeof value.id === 'number'
}

/* TODO
  - [ ] Handle focus/blur
  - [ ] Handle no results
  - [ ] Show avatar in input
  - [ ] For patients, show date of birth, gender, and national id
*/
export default function PersonSearch({
  href,
  name,
  required,
  label,
  value,
  addable,
}: {
  href: string
  name: string
  required?: boolean
  label?: string
  value?: { id?: number; name: string }
  addable?: boolean
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [selected, setSelected] = useState<
    { id: number | 'add'; name: string } | null
  >(
    hasId(value) ? value : null,
  )
  const [people, setPeople] = useState<HasId<{ name: string }>[]>([])

  const [search, setSearchImmediate] = useState(value?.name ?? '')

  // Don't search until the user has stopped typing for a bit
  const [setSearch] = useState({
    delay: debounce(setSearchImmediate, 220),
  })

  const onDocumentClick = useCallback(() => {
    const nextIsFocused = document.activeElement ===
      document.querySelector(`input[name="${name}_name"]`)
    setIsFocused(nextIsFocused)
  }, [setIsFocused])

  useEffect(() => {
    self.addEventListener('click', onDocumentClick)
    self.addEventListener('focus', onDocumentClick)
    self.addEventListener('blur', onDocumentClick)
    return () => {
      self.removeEventListener('click', onDocumentClick)
      self.removeEventListener('focus', onDocumentClick)
      self.removeEventListener('blur', onDocumentClick)
    }
  })

  useEffect(() => {
    const url = new URL(`${window.location.origin}${href}`)
    if (search && search !== value?.name) {
      url.searchParams.set('search', search)
    }

    fetch(url, {
      headers: { accept: 'application/json' },
    }).then(async (response) => {
      const people = await response.json()
      assert(Array.isArray(people))
      setPeople(people)
    }).catch(console.error)
  }, [search])

  const showSearchResults = isFocused &&
    (people.length > 0 || (search && addable))

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
            {people.map((person) => (
              <PersonSearchResult
                person={person}
                isSelected={selected?.id === person.id}
                onSelect={() => {
                  setIsFocused(false)
                  setSelected(person)
                  setSearchImmediate(person.name)

                  const input = document.querySelector(
                    `input[name="${name}_name"]`,
                  )
                  assert(input instanceof HTMLInputElement)

                  // Create a new keyboard event for the 'Tab' key
                  const tabKeyEvent = new KeyboardEvent('keydown', {
                    key: 'Tab',
                    code: 'Tab',
                    keyCode: 9,
                    which: 9,
                    bubbles: true,
                    cancelable: true,
                  })

                  // Dispatch the event to the input
                  input.dispatchEvent(tabKeyEvent)
                  // console.log('ELWE:LWE', input)
                  // const blur = new Event('blur')
                  // input.dispatchEvent(blur)
                  // console.log('MMMMMM:LWE', input)
                }}
              />
            ))}
            {addable && search
              ? (
                <AddButtonSearchResult
                  searchedValue={search}
                  isSelected={selected?.id === 'add'}
                  onSelect={() => setSelected({ name: search, id: 'add' })}
                />
              )
              : null}
          </SearchResults>
        )}
      </SearchInput>
      <span id='nonsense' />
      {(typeof selected?.id === 'number') && (
        <input type='hidden' name={`${name}_id`} value={selected.id} />
      )}
    </div>
  )
}
