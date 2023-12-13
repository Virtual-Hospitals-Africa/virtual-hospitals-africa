import { useCallback, useEffect, useState } from 'preact/hooks'
import SearchResults, {
  MedicationSearchResult,
} from '../components/library/SearchResults.tsx'
import { SearchInput, Select } from '../components/library/form/Inputs.tsx'
import { assert } from 'std/assert/assert.ts'
import debounce from '../util/debounce.ts'
import { DrugSearchResult, HasId } from '../types.ts'
import FormRow from '../components/library/form/Row.tsx'
import { Dosages, IntakeFrequencies } from '../db/models/patient_conditions.ts'
import { Maybe } from '../types.ts'

const units = new Set(['MG', 'G', 'ML', 'L', 'MCG', 'UG', 'IU'])

// TODO: handle manufactured medications & date ranges
export default function MedicationSearch({
  name,
  label,
  required,
  value,
}: {
  name: string
  label?: Maybe<string>
  required?: boolean
  value?: {
    drug_id: number
    drug_generic_name: string
    medication_id: number | null
    manufactured_medication_id: number | null
    dosage: number
    strength: number
    intake_frequency: string
    start_date: string
    end_date: string | null
  }
}) {
  const [shouldSetInitiallySelected, setShouldSetInitiallySelected] = useState(
    !!value,
  )
  const [isFocused, setIsFocused] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState<DrugSearchResult | null>(
    null,
  )
  const [selectedMedicationId, setSelectedMedicationId] = useState<
    number | null
  >(null)

  const [
    selectedManufacturedMedicationId,
    setSelectedManufacturedMedicationId,
  ] = useState<
    number | null
  >(null)
  const [selectedStrength, setSelectedStrength] = useState<
    number | null
  >(null)
  const [selectedIntakeFrequency, setSelectedIntakeFrequency] = useState<
    string | null
  >(value?.intake_frequency ?? null)
  const [selectedDosage, setSelectedDosage] = useState<number | null>(
    value?.dosage ?? null,
  )

  const [drugSearchResults, setDrugSearchResults] = useState<
    DrugSearchResult[]
  >([])
  const [search, setSearchImmediate] = useState(value?.drug_generic_name ?? '')
  const [setSearch] = useState({
    delay: debounce(setSearchImmediate, 220),
  })

  const selectedMedication = selectedDrug?.medications.find(
    (medication) => medication.medication_id === selectedMedicationId,
  )

  const denominatorUnit = selectedMedication?.strength_denominator_unit
  const denominatorIsMeasurement = denominatorUnit && units.has(denominatorUnit)
  const denominatorPlural = denominatorUnit &&
    (denominatorIsMeasurement
      ? denominatorUnit
      : denominatorUnit === 'SUPPOSITORY'
      ? 'SUPPOSITORIES'
      : denominatorUnit + 'S')

  useEffect(() => {
    console.log(
      'aaa',
      selectedDrug,
      selectedMedication,
      selectedStrength,
      selectedDosage,
    )
    if (!selectedDrug) return
    if (selectedDrug.medications.length === 1) {
      setSelectedMedicationId(selectedDrug.medications[0].medication_id)
    }
  }, [selectedDrug])

  useEffect(() => {
    console.log(
      'bbb',
      selectedDrug,
      selectedMedication,
      selectedStrength,
      selectedDosage,
    )
    if (!selectedMedication) return
    if (selectedMedication.strength_numerators.length === 1) {
      setSelectedStrength(selectedMedication.strength_numerators[0])
    }
  }, [selectedMedication])

  useEffect(() => {
    if (!selectedMedication) return
    if (!selectedStrength) return
    if (selectedDosage) return
    setSelectedDosage(selectedMedication.strength_denominator)
  }, [selectedMedication, selectedStrength])

  const onDocumentClick = useCallback(() => {
    setIsFocused(
      document.activeElement ===
        document.querySelector(`input[name="${name}.drug_generic_name"]`),
    )
  }, [])

  useEffect(() => {
    onDocumentClick()
    self.addEventListener('click', onDocumentClick)
    return () => self.removeEventListener('click', onDocumentClick)
  })

  const getMedications = async () => {
    if (!search) {
      setDrugSearchResults([])
      return
    }

    const url = new URL(`${window.location.origin}/app/drugs`)
    url.searchParams.set('search', search)

    await fetch(url, {
      headers: { accept: 'application/json' },
    }).then(async (response) => {
      const drugs = await response.json()
      assert(Array.isArray(drugs))
      setDrugSearchResults(drugs)
      if (shouldSetInitiallySelected) {
        const drug = drugs.find((d) => d.drug_id === value?.drug_id)
        if (drug) {
          setSelectedDrug(drug)
          setShouldSetInitiallySelected(false)
        }
      }
    }).catch(console.error)
  }

  useEffect(() => {
    getMedications()
  }, [search])

  const showSearchResults = isFocused &&
    selectedDrug?.drug_generic_name !== search &&
    ((drugSearchResults.length > 0) || search)

  return (
    <FormRow className='w-full'>
      <SearchInput
        name={`${name}.drug_generic_name`}
        label={label}
        value={selectedDrug?.drug_generic_name}
        required={required}
        onInput={(event) => {
          assert(event.target)
          assert('value' in event.target)
          assert(typeof event.target.value === 'string')
          setSelectedDrug(null)
          setSelectedMedicationId(null)
          setSelectedStrength(null)
          setSelectedDosage(null)
          setSelectedIntakeFrequency(null)
          setSearch.delay(event.target.value)
        }}
      >
        {showSearchResults && (
          <SearchResults>
            {drugSearchResults.map((drug) => (
              <MedicationSearchResult
                generic_name={drug.drug_generic_name}
                isSelected={drug?.drug_id === drug.drug_id}
                onSelect={() => {
                  setSelectedDrug(drug)
                  setSearchImmediate(drug.drug_generic_name)
                }}
              />
            ))}
          </SearchResults>
        )}
      </SearchInput>
      {selectedDrug && (
        <input
          type='hidden'
          name={`${name}.drug_id`}
          value={selectedDrug.drug_id}
        />
      )}
      <Select
        name={`${name}.medication_id`}
        required
        label={label && 'Form'}
        disabled={!selectedDrug}
        onChange={(event) =>
          event.currentTarget.value &&
          setSelectedMedicationId(Number(event.currentTarget.value))}
      >
        <option value=''>Select Form</option>
        {selectedDrug &&
          selectedDrug.medications.map((medication) => (
            <option
              value={medication.medication_id}
              selected={selectedMedicationId === medication.medication_id}
            >
              {medication.form}
            </option>
          ))}
      </Select>
      <Select
        name={`${name}.strength`}
        required
        label={label && 'Strength'}
        disabled={!selectedMedication}
        onChange={(event) =>
          event.currentTarget.value &&
          setSelectedStrength(Number(event.currentTarget.value))}
      >
        <option value=''>Select Strength</option>
        {selectedMedication &&
          selectedMedication.strength_numerators.map((numerator) => (
            <option value={numerator} selected={selectedStrength === numerator}>
              {numerator}
              {selectedMedication
                .strength_numerator_unit}/{selectedMedication
                  .strength_denominator === 1
                ? ''
                : selectedMedication.strength_denominator}
              {selectedMedication.strength_denominator_unit}
            </option>
          ))}
      </Select>
      <Select
        name={`${name}.dosage`}
        label={label && 'Dosage'}
        disabled={!(selectedMedication && selectedStrength)}
      >
        <option value=''>Select Dosage</option>
        {selectedMedication && selectedStrength &&
          Dosages.map(([dosage_text, dosage_value]) => (
            <option
              value={dosage_value * selectedMedication.strength_denominator}
              selected={selectedDosage ===
                (dosage_value * selectedMedication.strength_denominator)}
            >
              {selectedMedication.strength_denominator === 1
                ? dosage_text
                : dosage_value * selectedMedication.strength_denominator}
              {denominatorIsMeasurement ? '' : ' '}
              {dosage_value > 1 ? denominatorPlural : denominatorUnit}{' '}
              ({selectedStrength * dosage_value}
              {selectedMedication?.strength_numerator_unit})
            </option>
          ))}
      </Select>
      <Select
        name={`${name}.intake_frequency`}
        required
        label={label && 'Intake'}
        disabled={!selectedDrug}
      >
        <option value=''>Select Intake</option>
        {selectedDrug &&
          Object.entries(IntakeFrequencies).map(([code, label]) => (
            <option value={code} selected={selectedIntakeFrequency === code}>
              {label}
            </option>
          ))}
      </Select>
    </FormRow>
  )
}
