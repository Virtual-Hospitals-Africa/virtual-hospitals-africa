import { useCallback, useEffect, useState } from 'preact/hooks'
import SearchResults, {
  ConditionSearchResult,
} from '../components/library/SearchResults.tsx'
import { SearchInput } from '../components/library/form/Inputs.tsx'
import { assert } from 'https://deno.land/std@0.160.0/_util/assert.ts'
import debounce from '../util/debounce.ts'
import FormRow from '../components/library/form/Row.tsx'
import { Condition } from '../types.ts'

export default function ConditionSearch({
  name,
  label,
  required,
  value,
}: {
  name: string
  label: string
  required?: boolean
  value?: { key_id: string; primary_name: string }
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [selected, setSelected] = useState<
    { key_id: string; primary_name: string } | null
  >(value || null)
  const [conditions, setConditions] = useState<
    Condition[]
  >([])
  const [search, setSearchImmediate] = useState(value?.primary_name ?? '')
  const [setSearch] = useState({
    delay: debounce(setSearchImmediate, 220),
  })

  const onDocumentClick = useCallback(() => {
    setIsFocused(
      document.activeElement ===
        document.querySelector(`input[name="${name}.primary_name"]`),
    )
  }, [])

  useEffect(() => {
    onDocumentClick()
    self.addEventListener('click', onDocumentClick)
    return () => self.removeEventListener('click', onDocumentClick)
  })

  const getConditions = async () => {
    if (!search) {
      setConditions([])
      return
    }

    const url = new URL(`${window.location.origin}/app/conditions`)
    url.searchParams.set('search', search)

    await fetch(url, {
      headers: { accept: 'application/json' },
    }).then(async (response) => {
      const conditionsResult = await response.json()
      assert(Array.isArray(conditionsResult))
      setConditions(conditionsResult)
    }).catch(console.error)
  }

  useEffect(() => {
    getConditions()
  }, [search])

  const showSearchResults = isFocused &&
    selected?.primary_name !== search && (conditions.length > 0 || search)

  return (
    <FormRow className='w-full'>
      <SearchInput
        name={`${name}.primary_name`}
        label={label}
        value={selected?.primary_name}
        placeholder='Search for conditions'
        required={required}
        onInput={(event) => {
          assert(event.target)
          assert('value' in event.target)
          assert(typeof event.target.value === 'string')
          setSelected(null)
          setSearch.delay(event.target.value)
        }}
      >
        {showSearchResults && (
          <SearchResults>
            {conditions.map((c) => (
              <ConditionSearchResult
                condition={c.primary_name}
                isSelected={selected?.key_id === c?.key_id}
                onSelect={() => {
                  setSelected({
                    key_id: c.key_id,
                    primary_name: c.primary_name,
                  })
                  setSearchImmediate(c.primary_name)
                }}
              />
            ))}
          </SearchResults>
        )}
      </SearchInput>
      {selected && (
        <input type='hidden' name={`${name}.key_id`} value={selected.key_id} />
      )}
    </FormRow>
  )
}
