import { useCallback, useEffect, useState } from 'preact/hooks'
import SearchResults, {
  DrugSearchResult,
} from '../../components/library/SearchResults.tsx'
import { SearchInput } from '../../components/library/form/Inputs.tsx'
import { assert } from 'std/assert/assert.ts'
import debounce from '../../util/debounce.ts'
import { DrugSearchResult as DrugSearchResultData } from '../../types.ts'

export default function MedicationSearch({
  name,
  selectedDrug,
  clearSelected,
  setSelectedDrug,
}: {
  name: string
  selectedDrug: DrugSearchResultData | null
  clearSelected(): void
  setSelectedDrug(drug: DrugSearchResultData | null): void
}) {
  const [isFocused, setIsFocused] = useState(false)

  const [drugSearchResults, setDrugSearchResults] = useState<
    DrugSearchResultData[]
  >([])
  const [search, setSearchImmediate] = useState(
    selectedDrug?.drug_generic_name ?? '',
  )
  const [setSearch] = useState({
    delay: debounce(setSearchImmediate, 220),
  })

  const onDocumentClick = useCallback(() => {
    setIsFocused(
      document.activeElement ===
        document.querySelector(`input[name="${name}.generic_name"]`),
    )
  }, [])

  useEffect(() => {
    onDocumentClick()
    self.addEventListener('click', onDocumentClick)
    return () => self.removeEventListener('click', onDocumentClick)
  })

  const getMedications = async () => {
    if (!search) return setDrugSearchResults([])

    const url = new URL(`${window.location.origin}/app/drugs`)
    url.searchParams.set('search', search)

    await fetch(url, {
      headers: { accept: 'application/json' },
    }).then(async (response) => {
      const drugs = await response.json()
      assert(Array.isArray(drugs))
      setDrugSearchResults(drugs)
    }).catch(console.error)
  }

  useEffect(() => {
    getMedications()
  }, [search])

  const showSearchResults = isFocused &&
    selectedDrug?.drug_generic_name !== search &&
    ((drugSearchResults.length > 0) || search)

  return (
    <SearchInput
      name={`${name}.generic_name`}
      label='Drug'
      value={selectedDrug?.drug_generic_name}
      required
      onInput={(event) => {
        assert(event.target)
        assert('value' in event.target)
        assert(typeof event.target.value === 'string')
        clearSelected()
        setSearch.delay(event.target.value)
      }}
    >
      {showSearchResults && (
        <SearchResults>
          {drugSearchResults.map((drug) => (
            <DrugSearchResult
              drug={drug}
              isSelected={selectedDrug?.drug_id === drug.drug_id}
              onSelect={() => {
                setSelectedDrug(drug)
                setSearchImmediate(drug.drug_generic_name)
              }}
            />
          ))}
        </SearchResults>
      )}
      {selectedDrug && (
        <input
          type='hidden'
          name={`${name}.drug_id`}
          value={selectedDrug.drug_id}
        />
      )}
    </SearchInput>
  )
}
