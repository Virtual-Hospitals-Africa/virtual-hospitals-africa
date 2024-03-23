import { effect, useSignal } from '@preact/signals'
import { Select } from '../form/Inputs.tsx'
import { ManufacturedMedicationSearchResult } from '../../types.ts'
import FormRow from '../form/Row.tsx'
import ManufacturedMedicationSearch from './Search.tsx'

export default function MedicationInput(props: {
  name: string
  manufactured_medication: null | ManufacturedMedicationSearchResult
  strength: null | number
}) {
  const manufactured_medication = useSignal(props.manufactured_medication)
  const strength = useSignal(props.strength)

  effect(() => {
    if (
      manufactured_medication.value && !strength.value &&
      manufactured_medication.value.strength_numerators.length === 1
    ) {
      strength.value = manufactured_medication.value.strength_numerators[0]
    }
  })

  return (
    <div className='w-full justify-normal'>
      <FormRow className='w-full justify-normal'>
        <ManufacturedMedicationSearch
          label='Medication'
          name={props.name}
          value={manufactured_medication.value}
          required
          onSelect={(value) => {
            manufactured_medication.value = value ?? null
            strength.value = null
          }}
        />
      </FormRow>
      <FormRow className='w-full justify-normal'>
        <Select
          name={`${name}.strength`}
          required
          label='Strength'
          disabled={!manufactured_medication.value}
          onChange={(event) => {
            if (event.currentTarget.value) {
              strength.value = Number(event.currentTarget.value)
            }
          }}
        >
          <option value=''>Select Strength</option>
          {manufactured_medication.value?.strength_numerators.map((
            numerator,
          ) => (
            <option
              value={numerator}
              selected={strength.value === numerator}
            >
              {numerator}
              {manufactured_medication.value!
                .strength_numerator_unit}/{manufactured_medication.value!
                  .strength_denominator === 1
                ? ''
                : manufactured_medication.value!.strength_denominator}
              {manufactured_medication.value!.strength_denominator_unit}
            </option>
          ))}
        </Select>
      </FormRow>
    </div>
  )
}
