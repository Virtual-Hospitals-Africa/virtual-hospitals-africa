import { useCallback, useEffect, useState } from 'preact/hooks'
import SearchResults, {
  DrugSearchResult,
} from '../components/library/SearchResults.tsx'
import {
  DateInput,
  SearchInput,
  Select,
} from '../components/library/form/Inputs.tsx'
import { assert } from 'std/assert/assert.ts'
import debounce from '../util/debounce.ts'
import {
  DrugSearchResult as DrugSearchResultData,
  PreExistingConditionWithDrugs,
} from '../types.ts'
import FormRow from '../components/library/form/Row.tsx'
import { Dosages, IntakeFrequencies } from '../db/models/patient_conditions.ts'
import { isUnits } from '../util/units.ts'

export default function MedicationSearch({
  name,
  value,
}: {
  name: string
  value?: PreExistingConditionWithDrugs['medications'][0]
}) {
  const [shouldSetInitiallySelected, setShouldSetInitiallySelected] = useState(
    !!value,
  )
  const [isFocused, setIsFocused] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState<DrugSearchResultData | null>(
    value?.drug || null,
  )
  const [selectedMedicationId, setSelectedMedicationId] = useState<
    number | null
  >(
    value?.medication_id || null,
  )

  const [
    selectedManufacturedMedicationId,
    setSelectedManufacturedMedicationId,
  ] = useState<
    number | null
  >(value?.manufactured_medication_id ?? null)
  const [selectedStrength, setSelectedStrength] = useState<
    number | null
  >(value?.strength ?? null)
  const [selectedIntakeFrequency, setSelectedIntakeFrequency] = useState<
    string | null
  >(value?.intake_frequency ?? null)
  const [selectedDosage, setSelectedDosage] = useState<number | null>(
    value?.dosage ?? null,
  )

  const [drugSearchResults, setDrugSearchResults] = useState<
    DrugSearchResultData[]
  >(value ? [value.drug] : [])
  const [search, setSearchImmediate] = useState(value?.generic_name ?? '')
  const [setSearch] = useState({
    delay: debounce(setSearchImmediate, 220),
  })

  const selectedMedication = selectedDrug?.medications.find(
    (medication) => medication.medication_id === selectedMedicationId,
  )
  const selectedManufacturedMedication = selectedMedication?.manufacturers.find(
    (manufactured_medication) =>
      manufactured_medication.manufactured_medication_id ===
        selectedManufacturedMedicationId,
  )
  const strength_options =
    selectedManufacturedMedication?.strength_numerators ||
    selectedMedication?.strength_numerators

  const denominatorUnit = selectedMedication?.strength_denominator_unit
  const denominatorIsMeasurement = denominatorUnit && isUnits(denominatorUnit)
  const denominatorPlural = denominatorUnit &&
    (denominatorIsMeasurement
      ? denominatorUnit
      : denominatorUnit === 'SUPPOSITORY'
      ? 'SUPPOSITORIES'
      : denominatorUnit + 'S')

  useEffect(() => {
    if (!selectedDrug) return
    if (selectedMedicationId) return
    if (selectedDrug.medications.length === 1) {
      setSelectedMedicationId(selectedDrug.medications[0].medication_id)
    }
  }, [selectedDrug])

  useEffect(() => {
    if (!selectedMedication) return
    if (selectedStrength) return
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
    <div className='w-full justify-normal'>
      <FormRow className='w-full justify-normal'>
        <SearchInput
          name={`${name}.generic_name`}
          label='Drug'
          value={selectedDrug?.drug_generic_name}
          required
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
          label='Form'
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
        {
          /* TODO: revisit using manufactured medications.
            Could be valuable for prescriptions based on facility availability, but for now just gumming things up. */
        }
        <input
          type='hidden'
          className='hidden'
          name={`${name}.manufactured_medication_id`}
          value={selectedManufacturedMedicationId || ''}
        />
        {
          /* <Select
          name={`${name}.manufactured_medication_id`}
          label='Trade Name'
          disabled={!selectedMedication}
          onChange={(event) =>
            event.currentTarget.value &&
            setSelectedManufacturedMedicationId(
              Number(event.currentTarget.value),
            )}
        >
          <option value=''>Select Trade Name</option>
          {selectedMedication &&
            selectedMedication.manufacturers.map((manufactured_medication) => (
              <option
                value={manufactured_medication.manufactured_medication_id}
                selected={selectedManufacturedMedicationId ===
                  manufactured_medication.manufactured_medication_id}
              >
                {manufactured_medication.trade_name}{' '}
                ({manufactured_medication.manufacturer_name})
              </option>
            ))}
        </Select> */
        }
        <Select
          name={`${name}.strength`}
          required
          label='Strength'
          disabled={!selectedMedication}
          onChange={(event) =>
            event.currentTarget.value &&
            setSelectedStrength(Number(event.currentTarget.value))}
        >
          <option value=''>Select Strength</option>
          {selectedMedication && strength_options?.map((numerator) => (
            <option
              value={numerator}
              selected={selectedStrength === numerator}
            >
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
      </FormRow>
      <FormRow className='w-full justify-normal'>
        <Select
          name={`${name}.dosage`}
          label='Dosage'
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
          label='Intake'
          disabled={!selectedDrug}
        >
          <option value=''>Select Intake</option>
          {selectedDrug &&
            Object.entries(IntakeFrequencies).map(([code, label]) => (
              <option
                value={code}
                selected={selectedIntakeFrequency === code}
              >
                {label}
              </option>
            ))}
        </Select>
        <DateInput
          name={`${name}.start_date`}
          label='Start Date'
          required
          value={value?.start_date}
        />
        <DateInput
          name={`${name}.end_date`}
          label='End Date'
          value={value?.end_date}
        />
      </FormRow>
    </div>
  )
}
