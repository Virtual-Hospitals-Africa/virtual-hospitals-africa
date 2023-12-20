import { useCallback, useEffect, useState } from 'preact/hooks'
import { SearchInput } from '../../components/library/form/Inputs.tsx'
import { assert } from 'std/assert/assert.ts'
import SearchResults, {
  AllergySearchResult,
} from '../../components/library/SearchResults.tsx'
import debounce from '../../util/debounce.ts'
import { Allergy, PreExistingAllergy } from '../../types.ts'

export default function AllergySearch({
  without_ids,
  addAllergy,
}: {
  without_ids: number[]
  addAllergy(allergy: PreExistingAllergy): void
}) {
  const [search, setSearchImmediate] = useState('')
  const [searchResults, setSearchResults] = useState<Allergy[]>([])
  const [setSearch] = useState({
    delay: debounce(setSearchImmediate, 220),
  })
  const [isFocused, setIsFocused] = useState(false)

  const getAllergies = async () => {
    if (!search) return setSearchResults([])
    const url = new URL(`${window.location.origin}/app/allergies`)
    url.searchParams.set('search', search)
    if (without_ids?.length) {
      url.searchParams.set('without_ids', without_ids.join(','))
    }

    await fetch(url, {
      headers: { accept: 'application/json' },
    }).then(async (response) => {
      const allergiesList = await response.json()
      assert(Array.isArray(allergiesList))
      setSearchResults(allergiesList)
    }).catch(console.error)
  }

  useEffect(() => {
    getAllergies()
  }, [search])

  const onDocumentClick = useCallback(() => {
    setIsFocused(
      document.activeElement ===
        document.querySelector(`input[name="allergy_search"]`),
    )
  }, [])

  useEffect(() => {
    onDocumentClick()
    self.addEventListener('click', onDocumentClick)
    return () => self.removeEventListener('click', onDocumentClick)
  })

  return (
    <SearchInput
      name='allergy_search'
      label='Allergies'
      value={search}
      onInput={(event) => {
        assert(event.target)
        assert('value' in event.target)
        assert(typeof event.target.value === 'string')
        setSearch.delay(event.target.value)
      }}
    >
      {isFocused && search && searchResults.length > 0 && (
        <SearchResults>
          {searchResults.map((allergy) => (
            <AllergySearchResult
              allergy={allergy.name}
              onSelect={() => {
                addAllergy({ allergy_id: allergy.id, name: allergy.name })
                setSearchImmediate('')
              }}
            />
          ))}
        </SearchResults>
      )}
    </SearchInput>
  )
}
