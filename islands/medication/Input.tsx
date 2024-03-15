import { useEffect, useState } from 'preact/hooks'
import { DateInput, Select, TextArea } from '../form/Inputs.tsx'
import {
  DrugSearchResult as DrugSearchResultData,
  PreExistingConditionWithDrugs,
} from '../../types.ts'
import FormRow from '../form/Row.tsx'
import MedicationSearch from './Search.tsx'
import {
  dosageDisplay,
  Dosages,
  IntakeFrequencies,
} from '../../shared/medication.ts'

export default function MedicationInput({
  name,
  value,
}: {
  name: string
  value?: PreExistingConditionWithDrugs['medications'][0]
}) {
  const [drug, setDrug] = useState<DrugSearchResultData | null>(
    value?.drug || null,
  )
  const [medication_id, setMedicationId] = useState<
    number | null
  >(
    value?.medication_id || null,
  )

  const [
    manufactured_medication_id,
    setManufacturedMedicationId,
  ] = useState<
    number | null
  >(value?.manufactured_medication_id ?? null)

  const [strength, setStrength] = useState<
    number | null
  >(value?.strength ?? null)
  const [intake_frequency, setIntakeFrequency] = useState<
    string | null
  >(value?.intake_frequency ?? null)
  const [dosage, setDosage] = useState<number | null>(
    value?.dosage ?? null,
  )
  const [route, setRoute] = useState<string | null>(
    value?.route ?? null,
  )
  const [specialInstructions, setSpecialInstructions] = useState<string | null>(
    value?.special_instructions ?? null,
  )

  const medication = drug?.medications.find(
    (m) => m.medication_id === medication_id,
  )
  const manufactured_medication = medication?.manufacturers.find(
    (mm) =>
      mm.manufactured_medication_id ===
        manufactured_medication_id,
  )
  const strength_options = manufactured_medication?.strength_numerators ||
    medication?.strength_numerators

  const denominatorUnit = medication?.strength_denominator_unit
  const denominatorIsMeasurement = medication
    ?.strength_denominator_is_units
  const denominatorPlural = denominatorUnit &&
    (denominatorIsMeasurement
      ? denominatorUnit
      : denominatorUnit === 'SUPPOSITORY'
      ? 'SUPPOSITORIES'
      : denominatorUnit + 'S')

  useEffect(() => {
    if (!drug) return
    if (medication_id) return
    if (drug.medications.length === 1) {
      setMedicationId(drug.medications[0].medication_id)
    }
  }, [drug])

  useEffect(() => {
    if (!medication) return
    if (strength) return
    if (medication.strength_numerators.length === 1) {
      setStrength(medication.strength_numerators[0])
    }
  }, [medication])

  useEffect(() => {
    if (!medication) return
    if (!strength) return
    if (dosage) return
    setDosage(medication.strength_denominator)
  }, [medication, strength])

  return (
    <div className='w-full justify-normal'>
      <FormRow className='w-full justify-normal'>
        <MedicationSearch
          label='Drug'
          name={name}
          value={drug}
          required
          onSelect={(drug) => {
            setDrug(drug ?? null)
            setMedicationId(null)
            setStrength(null)
            setDosage(null)
            setIntakeFrequency(null)
          }}
        />
        <Select
          name={`${name}.medication_id`}
          required
          label='Form'
          disabled={!drug}
          onChange={(event) =>
            event.currentTarget.value &&
            setMedicationId(Number(event.currentTarget.value))}
        >
          <option value=''>Select Form</option>
          {drug &&
            drug.medications.map((medication) => (
              <option
                value={medication.medication_id}
                selected={medication_id === medication.medication_id}
              >
                {medication.form_route}
              </option>
            ))}
        </Select>
        {medication && (medication.routes.length > 1) && (
          <Select
            name={`${name}.route`}
            required
            label='Route'
            disabled={!drug}
            onChange={(event) =>
              event.currentTarget.value &&
              setRoute(event.currentTarget.value)}
          >
            <option value=''>Select Form</option>
            {medication.routes.map((route) => (
              <option
                value={route}
                selected={route === route}
              >
                {route}
              </option>
            ))}
          </Select>
        )}
        {medication && (medication.routes.length === 1) && (
          <input
            name={`${name}.route`}
            type='hidden'
            value={medication.routes[0]}
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
          value={manufactured_medication_id || ''}
        />
        {
          /* <Select
          name={`${name}.manufactured_medication_id`}
          label='Trade Name'
          disabled={!medication}
          onChange={(event) =>
            event.currentTarget.value &&
            setManufacturedMedicationId(
              Number(event.currentTarget.value),
            )}
        >
          <option value=''>Select Trade Name</option>
          {medication &&
            medication.manufacturers.map((manufactured_medication) => (
              <option
                value={manufactured_medication.manufactured_medication_id}
                selected={manufactured_medication_id ===
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
          disabled={!medication}
          onChange={(event) =>
            event.currentTarget.value &&
            setStrength(Number(event.currentTarget.value))}
        >
          <option value=''>Select Strength</option>
          {medication && strength_options?.map((numerator) => (
            <option
              value={numerator}
              selected={strength === numerator}
            >
              {numerator}
              {medication
                .strength_numerator_unit}/{medication
                  .strength_denominator === 1
                ? ''
                : medication.strength_denominator}
              {medication.strength_denominator_unit}
            </option>
          ))}
        </Select>
      </FormRow>
      <FormRow className='w-full justify-normal'>
        <Select
          name={`${name}.dosage`}
          label='Dosage'
          disabled={!(medication && strength)}
        >
          <option value=''>Select Dosage</option>
          {medication && strength &&
            Dosages.map(([dosage_text, dosage_value]) => (
              <option
                value={dosage_value * medication.strength_denominator}
                selected={dosage ===
                  (dosage_value * medication.strength_denominator)}
              >
                {dosageDisplay({
                  dosage_text,
                  dosage: dosage_value,
                  strength,
                  ...medication,
                })}
              </option>
            ))}
        </Select>
        <Select
          name={`${name}.intake_frequency`}
          required
          label='Frequency'
          disabled={!drug}
        >
          <option value=''>Select Intake</option>
          {drug &&
            Object.entries(IntakeFrequencies).map(([code, label]) => (
              <option
                value={code}
                selected={intake_frequency === code}
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
          value={specialInstructions}
          onInput={(event) => setSpecialInstructions(event.currentTarget.value)}
        />
      </FormRow>
    </div>
  )
}
