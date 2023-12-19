import { useEffect, useState } from 'preact/hooks'
import {
  DateInput,
  Select,
  TextArea,
} from '../../components/library/form/Inputs.tsx'
import {
  DrugSearchResult as DrugSearchResultData,
  PreExistingConditionWithDrugs,
} from '../../types.ts'
import FormRow from '../../components/library/form/Row.tsx'
import {
  Dosages,
  IntakeFrequencies,
} from '../../db/models/patient_conditions.ts'
import MedicationSearch from './Search.tsx'
import Form from '../../components/library/form/Form.tsx'

export default function MedicationInput({
  name,
  value,
}: {
  name: string
  value?: PreExistingConditionWithDrugs['medications'][0]
}) {
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
  const [selectedRoute, setSelectedRoute] = useState<string | null>(
    value?.route ?? null,
  )
  const [drugSearchResults, setDrugSearchResults] = useState<
    DrugSearchResultData[]
  >(value ? [value.drug] : [])

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
  const denominatorIsMeasurement = selectedMedication
    ?.strength_denominator_is_units
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

  return (
    <div className='w-full justify-normal'>
      <FormRow className='w-full justify-normal'>
        <MedicationSearch
          name={name}
          selectedDrug={selectedDrug}
          setSelectedDrug={setSelectedDrug}
          clearSelected={() => {
            setSelectedDrug(null)
            setSelectedMedicationId(null)
            setSelectedStrength(null)
            setSelectedDosage(null)
            setSelectedIntakeFrequency(null)
          }}
        />
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
                {medication.form_route}
              </option>
            ))}
        </Select>
        {selectedMedication && (selectedMedication.routes.length > 1) && (
          <Select
            name={`${name}.route`}
            required
            label='Route'
            disabled={!selectedDrug}
            onChange={(event) =>
              event.currentTarget.value &&
              setSelectedRoute(event.currentTarget.value)}
          >
            <option value=''>Select Form</option>
            {selectedMedication.routes.map((route) => (
              <option
                value={route}
                selected={selectedRoute === route}
              >
                {route}
              </option>
            ))}
          </Select>
        )}
        {selectedMedication && (selectedMedication.routes.length === 1) && (
          <input
            name={`${name}.route`}
            type='hidden'
            value={selectedMedication.routes[0]}
          />
        )}
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
          label='Frequency'
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
      <FormRow>
        <TextArea
          name={`${name}.special_instructions`}
          className='w-full'
          label='Special Instructions'
          value={value?.special_instructions}
        />
      </FormRow>
    </div>
  )
}
