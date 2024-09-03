import { useEffect, useState } from 'preact/hooks'
import { Select, TextArea } from '../form/Inputs.tsx'
import {
  Diagnosis,
  DrugSearchResult as DrugSearchResultData,
  PrescriptionMedicationWithDrug,
} from '../../types.ts'
import FormRow from '../form/Row.tsx'
import DrugSearch from '../drug/Search.tsx'
import {
  dosageDisplay,
  Dosages,
  IntakeFrequencies,
  strengthDisplay,
} from '../../shared/medication.ts'

export function MedicationScheduleInput({
  name,
  diagnoses,
  value,
}: {
  name: string
  diagnoses: Diagnosis[]
  value?: PrescriptionMedicationWithDrug
}) {
  const [drug, setDrug] = useState<DrugSearchResultData | null>(
    value?.drug || null,
  )
  const [medication_id, setMedicationId] = useState<
    string | null
  >(
    value?.medication_id || null,
  )

  const [strength_numerator, setStrengthNumerator] = useState<
    number | null
  >(value?.strength_numerator ?? null)

  // const [intake_frequency, setIntakeFrequency] = useState<
  //   string | null
  // >(value?.intake_frequency ?? null)
  // const [dosage, setDosage] = useState<number | null>(
  //   value?.dosage ?? null,

  const [route, setRoute] = useState<string | null>(
    value?.route ?? null,
  )
  const [specialInstructions, setSpecialInstructions] = useState<string | null>(
    value?.special_instructions ?? null,
  )

  const medication = drug?.medications.find(
    (m) => m.medication_id === medication_id,
  )
  const strength_options = medication?.strength_numerators

  useEffect(() => {
    if (!drug) return
    if (medication_id) return
    if (drug.medications.length === 1) {
      setMedicationId(drug.medications[0].medication_id)
    }
  }, [drug])

  useEffect(() => {
    if (!medication) return
    if (strength_numerator) return
    if (medication.strength_numerators.length === 1) {
      setStrengthNumerator(medication.strength_numerators[0])
    }
  }, [medication])

  useEffect(() => {
    if (!medication) return
    if (!strength_numerator) return
    if (dosage) return
    setDosage(medication.strength_denominator)
  }, [medication, strength_numerator])

  return (
    <FormRow className='w-full justify-normal'>
      <Select
        name={`${name}.dosage`}
        label='Dosage'
        disabled={!(medication && strength_numerator)}
      >
        <option value=''>Select Dosage</option>
        {medication && strength_numerator &&
          Dosages.map(([dosage_text, dosage_value]) => (
            <option
              value={dosage_value * medication.strength_denominator}
              selected={dosage ===
                (dosage_value * medication.strength_denominator)}
            >
              {dosageDisplay({
                dosage_text,
                dosage: dosage_value,
                strength_numerator,
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
    </FormRow>
  )
}
