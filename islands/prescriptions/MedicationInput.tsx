import { useEffect, useState } from 'preact/hooks'
import { Select, SelectWithOptions, TextArea } from '../form/Inputs.tsx'
import {
  Diagnosis,
  DrugSearchResult as DrugSearchResultData,
  PrescriptionMedicationWithDrug,
} from '../../types.ts'
import FormRow from '../../components/library/FormRow.tsx'
import DrugSearch from '../drug/Search.tsx'
import { strengthDisplay } from '../../shared/medication.ts'
import { AddRow } from '../AddRemove.tsx'
import { ScheduleRow } from './ScheduleRow.tsx'

export function PrescriptionMedicationInput({
  name,
  diagnoses,
  value,
  medicationSelected,
}: {
  name: string
  diagnoses: Diagnosis[]
  value: Partial<PrescriptionMedicationWithDrug>
  medicationSelected(
    new_medication_id: string,
    values: Partial<PrescriptionMedicationWithDrug>,
  ): void
}) {
  const [patient_condition_id, setPatientConditionId] = useState<
    string | undefined
  >(
    value.patient_condition_id,
  )

  const [drug, setDrug] = useState<DrugSearchResultData | undefined>(
    value.drug,
  )
  const [medication_id, _setMedicationId] = useState<
    string | undefined
  >(
    value.medication_id,
  )

  const [schedules, setSchedules] = useState(value.schedules ?? [{}])

  const setMedicationId = (medication_id: string) => {
    _setMedicationId(medication_id)
    medicationSelected(medication_id, {
      ...value,
      drug,
      medication_id,
    })
  }

  const addSchedule = () => {
    setSchedules([...schedules, {}])
  }

  const [strength_numerator, setStrengthNumerator] = useState<
    number | undefined
  >(value.strength_numerator)

  const [route, setRoute] = useState<string | undefined>(
    value.route,
  )
  const [special_instructions, setSpecialInstructions] = useState<
    string | undefined
  >(
    value.special_instructions ?? undefined,
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

  return (
    <div className='w-full justify-normal'>
      <FormRow className='w-full justify-normal'>
        <SelectWithOptions
          name={`${name}.patient_condition_id`}
          required
          label='Condition'
          readonly={diagnoses.length === 1}
          value={patient_condition_id}
          options={diagnoses.map((diagnosis) => ({
            value: diagnosis.patient_condition_id,
            label: diagnosis.name,
          }))}
          onChange={(event) =>
            event.currentTarget.value &&
            setPatientConditionId(event.currentTarget.value)}
        />
        <DrugSearch
          label='Drug'
          name={name}
          value={drug}
          required
          readonly={!!medication_id}
          onSelect={setDrug}
        />
      </FormRow>
      <FormRow className='w-full justify-normal'>
        <Select
          // The medication_id is the unique identifier and handled by the parent component
          name={null}
          required
          label='Form'
          disabled={!drug}
          readonly={!!medication_id}
          onChange={(event) =>
            event.currentTarget.value &&
            setMedicationId(event.currentTarget.value)}
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
            {medication.routes.map((route_option) => (
              <option
                value={route_option}
                selected={route_option === route}
              >
                {route_option}
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
        <Select
          name={`${name}.strength`}
          required
          label='Strength'
          disabled={!medication}
          onChange={(event) =>
            event.currentTarget.value &&
            setStrengthNumerator(Number(event.currentTarget.value))}
        >
          <option value=''>Select Strength</option>
          {medication &&
            strength_options?.map((strength_numerator_option) => (
              <option
                value={strength_numerator_option}
                selected={strength_numerator_option === strength_numerator}
              >
                {strengthDisplay({
                  strength_numerator: strength_numerator_option,
                  strength_numerator_unit: medication.strength_numerator_unit,
                  strength_denominator: medication.strength_denominator,
                  strength_denominator_unit:
                    medication.strength_denominator_unit,
                })}
              </option>
            ))}
        </Select>
      </FormRow>
      <FormRow>
        <TextArea
          name={`${name}.special_instructions`}
          className='w-full'
          label='Special Instructions'
          value={special_instructions}
          onInput={(event) => setSpecialInstructions(event.currentTarget.value)}
        />
      </FormRow>
      <div>
        <h3 className='text-sm py-2'>Schedules</h3>
        {schedules.map((schedule, index) => (
          <ScheduleRow
            key={index}
            name={`${name}.schedules.${index}`}
            value={schedule}
            medication={medication}
            strength_numerator={strength_numerator}
            remove={index
              ? () => {
                const next_schedules = [...schedules]
                next_schedules.splice(index, 1)
                setSchedules(next_schedules)
              }
              : undefined}
          />
        ))}
      </div>

      <AddRow onClick={addSchedule} text='Add Schedule' />
    </div>
  )
}
