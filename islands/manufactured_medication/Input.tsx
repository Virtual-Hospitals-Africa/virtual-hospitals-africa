import { effect, useSignal } from '@preact/signals'
import { Select } from '../form/Inputs.tsx'
import { ManufacturedMedicationSearchResult } from '../../types.ts'
import FormRow from '../form/Row.tsx'
import ManufacturedMedicationSearch from './Search.tsx'

export default function MedicationInput({
  name,
}: {
  name: string
}) {
  const manufactured_medication = useSignal<
    null | ManufacturedMedicationSearchResult
  >(null)
  const strength = useSignal<null | number>(null)

  effect(() => {
    if (
      manufactured_medication.value && !strength.value &&
      manufactured_medication.value.strength_numerators
    ) {
      strength.value = null
    }
  })

  return (
    <div className='w-full justify-normal'>
      <FormRow className='w-full justify-normal'>
        <ManufacturedMedicationSearch
          label='Medication'
          name={name}
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
