import { useCallback, useEffect, useState } from 'preact/hooks'
import SearchResults, {
  MedicationSearchResult,
} from '../components/library/SearchResults.tsx'
import { SearchInput, Select } from '../components/library/form/Inputs.tsx'
import { assert } from 'https://deno.land/std@0.160.0/_util/assert.ts'
import debounce from '../util/debounce.ts'
import { Medication } from '../types.ts'
import FormRow from '../components/library/form/Row.tsx'
import { MedicinesFrequencyList } from '../db/models/medications.ts'

export default function MedicationSearch({
  name,
  label,
  required,
  value,
}: {
  name: string
  label: string
  required?: boolean
  value?: {
    key_id: string
    generic_name: string
    dosage: string
    intake_frequency: string
    strength: string
  }
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [selected, setSelected] = useState<
    | {
      key_id: string
      generic_name: string
      dosage?: string
      intake_frequency?: string
    }
    | null
  >(value || null)
  const [medications, setMedications] = useState<Medication[]>([])
  const [search, setSearchImmediate] = useState(value?.generic_name ?? '')
  const [setSearch] = useState({
    delay: debounce(setSearchImmediate, 220),
  })
  const [strengthOptions, setStrengthOptions] = useState<string[]>(
    value?.strength.split(';') || [],
  )
  const intakeFrequencies = MedicinesFrequencyList

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
    if (!search) {
      setMedications([])
      return
    }

    const url = new URL(`${window.location.origin}/app/medications`)
    url.searchParams.set('search', search)

    await fetch(url, {
      headers: { accept: 'application/json' },
    }).then(async (response) => {
      const meds = await response.json()
      assert(Array.isArray(meds))
      setMedications(meds)
    }).catch(console.error)
  }

  useEffect(() => {
    getMedications()
  }, [search])

  const showSearchResults = isFocused &&
    selected?.generic_name !== search && ((medications.length > 0) || search)

  return (
    <FormRow className='w-full'>
      <SearchInput
        name={`${name}.generic_name`}
        label={label}
        value={selected?.generic_name}
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
            {medications.map((med) => (
              <MedicationSearchResult
                generic_name={med.generic_name}
                isSelected={selected?.key_id === med?.key_id}
                onSelect={() => {
                  setSelected({
                    key_id: med.key_id,
                    generic_name: med.generic_name,
                  })
                  assert(med.strength)
                  setStrengthOptions(med.strength.split(';'))
                  setSearchImmediate(med.generic_name)
                }}
              />
            ))}
          </SearchResults>
        )}
      </SearchInput>
      {selected && (
        <input type='hidden' name={`${name}.key_id`} value={selected.key_id} />
      )}
      <Select
        name={`${name}.dosage`}
        required
        label='Dosage'
        onChange={(event) => {
          assert(event.target)
          assert('value' in event.target)
          assert(typeof event.target.value === 'string')
          assert(selected)
          setSelected({
            ...selected,
            dosage: event.target.value,
          })
        }}
      >
        <option value=''>Select</option>
        {selected &&
          strengthOptions.map((d) => (
            <option value={d} selected={selected?.dosage === d}>{d}</option>
          ))}
      </Select>
      <Select
        name={`${name}.intake_frequency`}
        required
        label='Intake'
        onChange={(event) => {
          assert(event.target)
          assert('value' in event.target)
          assert(typeof event.target.value === 'string')
          assert(selected)
          setSelected({
            ...selected,
            intake_frequency: event.target.value,
          })
        }}
      >
        <option value=''>Select</option>
        {selected &&
          intakeFrequencies.map((d) => (
            <option value={d} selected={selected?.intake_frequency === d}>
              {d}
            </option>
          ))}
      </Select>
    </FormRow>
  )
}
