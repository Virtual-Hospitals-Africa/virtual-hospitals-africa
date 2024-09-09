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
  strengthDisplay,
} from '../../shared/medication.ts'
import { computed, effect, useSignal } from '@preact/signals'

export default function DrugInput({
  name,
  value,
}: {
  name: string
  value?: PreExistingConditionWithDrugs['medications'][number]
}) {
  const drug = useSignal<DrugSearchResultData | null>(
    value?.drug || null,
  )
  const medication_id = useSignal<string | null>(
    value?.medication_id || null,
  )
  const strength_numerator = useSignal<
    number | null
  >(value?.strength ?? null)

  const intake_frequency = useSignal<
    string | null
  >(value?.intake_frequency ?? null)

  const dosage = useSignal<number | null>(
    value?.dosage ?? null,
  )
  const route = useSignal<string | null>(
    value?.route ?? null,
  )
  const special_instructions = useSignal<string | null>(
    value?.special_instructions ?? null,
  )

  const medication = computed(() =>
    drug.value?.medications.find(
      (m) => m.medication_id === medication_id.value,
    )
  )

  const strength_numerator_options = computed(() =>
    medication.value?.strength_numerators
  )

  effect(() => {
    if (!drug.value) return
    if (medication_id.value) return
    if (drug.value.medications.length === 1) {
      medication_id.value = drug.value.medications[0].medication_id
    }
  })

  effect(() => {
    if (!medication.value) return
    if (strength_numerator.value) return
    if (medication.value.strength_numerators.length === 1) {
      strength_numerator.value = medication.value.strength_numerators[0]
    }
  })

  effect(() => {
    if (!medication.value) return
    if (!strength_numerator.value) return
    if (dosage.value) return
    dosage.value = medication.value.strength_denominator
  })

  return (
    <div className='w-full justify-normal'>
      <FormRow className='w-full justify-normal'>
        <MedicationSearch
          label='Drug'
          name={name}
          value={drug.value}
          required
          onSelect={(d) => {
            drug.value = d ?? null
            medication_id.value = null
            strength_numerator.value = null
            dosage.value = null
            intake_frequency.value = null
          }}
        />
      </FormRow>
      <FormRow className='w-full justify-normal'>
        <Select
          name={`${name}.medication_id`}
          required
          label='Form'
          disabled={!drug}
          onChange={(event) => {
            if (event.currentTarget.value) {
              medication_id.value = event.currentTarget.value
            }
          }}
        >
          <option value=''>Select Form</option>
          {drug.value?.medications.map((medication) => (
            <option
              value={medication.medication_id}
              selected={medication_id.value === medication.medication_id}
            >
              {medication.form_route}
            </option>
          ))}
        </Select>
        {medication.value && (medication.value.routes.length > 1) && (
          <Select
            name={`${name}.route`}
            required
            label='Route'
            disabled={!drug}
            onChange={(event) => route.value = event.currentTarget.value}
          >
            <option value=''>Select Form</option>
            {medication.value.routes.map((route_option) => (
              <option
                value={route_option}
                selected={route_option === route.value}
              >
                {route_option}
              </option>
            ))}
          </Select>
        )}
        {medication.value && (medication.value.routes.length === 1) && (
          <input
            name={`${name}.route`}
            type='hidden'
            value={medication.value.routes[0]}
          />
        )}
        <Select
          name={`${name}.strength`}
          required
          label='Strength'
          disabled={!medication}
          onChange={(event) => {
            if (event.currentTarget.value) {
              strength_numerator.value = Number(event.currentTarget.value)
            } else {
              strength_numerator.value = null
            }
          }}
        >
          <option value=''>Select Strength</option>
          {medication.value &&
            strength_numerator_options.value?.map((
              strength_numerator_option,
            ) => (
              <option
                value={strength_numerator_option}
                selected={strength_numerator_option ===
                  strength_numerator.value}
              >
                {strengthDisplay({
                  strength_numerator: strength_numerator_option,
                  strength_numerator_unit:
                    medication.value!.strength_numerator_unit,
                  strength_denominator: medication.value!.strength_denominator,
                  strength_denominator_unit:
                    medication.value!.strength_denominator_unit,
                })}
              </option>
            ))}
        </Select>
      </FormRow>
      <FormRow className='w-full justify-normal'>
        <Select
          name={`${name}.dosage`}
          label='Dosage'
          disabled={!(medication.value && strength_numerator.value)}
        >
          <option value=''>Select Dosage</option>
          {medication.value && strength_numerator.value &&
            Dosages.map(([dosage_text, dosage_value]) => (
              <option
                value={dosage_value * medication.value!.strength_denominator}
                selected={dosage.value ===
                  (dosage_value * medication.value!.strength_denominator)}
              >
                {dosageDisplay({
                  dosage_text,
                  dosage: dosage_value,
                  strength_numerator: strength_numerator.value!,
                  ...medication.value!,
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
          <option value=''>Select Frequency</option>
          {drug &&
            Object.entries(IntakeFrequencies).map(([code, label]) => (
              <option
                value={code}
                selected={intake_frequency.value === code}
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
          value={special_instructions.value}
          onInput={(event) =>
            special_instructions.value = event.currentTarget.value}
        />
      </FormRow>
    </div>
  )
}
