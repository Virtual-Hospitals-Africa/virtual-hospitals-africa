import { computed, effect, useSignal } from '@preact/signals'
import { DateInput, NumberInput, Select, TextInput } from '../form/Inputs.tsx'
import { ManufacturedMedicationSearchResult, Maybe } from '../../types.ts'
import FormRow from '../form/Row.tsx'
import ManufacturedMedicationSearch from './Search.tsx'
import AsyncSearch from '../AsyncSearch.tsx'
import { containerLabels, denominatorPlural } from '../../shared/medication.ts'

export default function ManufacturedMedicationInput(props: {
  name: string
  manufactured_medication: null | ManufacturedMedicationSearchResult
  last_procurement?: Maybe<{
    strength: number
    quantity: number
    container_size: number
    number_of_containers: number
    procurer_id: number
    procurer_name: string
    batch_number: null | string
  }>
  today: string
}) {
  const manufactured_medication = useSignal(props.manufactured_medication)
  const strength = useSignal(props.last_procurement?.strength ?? null)
  const container_size = useSignal(props.last_procurement?.container_size ?? 0)
  const number_of_containers = useSignal(
    props.last_procurement?.number_of_containers ?? 0,
  )

  effect(() => {
    if (
      manufactured_medication.value && !strength.value &&
      manufactured_medication.value.strength_numerators.length === 1
    ) {
      strength.value = manufactured_medication.value.strength_numerators[0]
    }
  })

  const container_labels = computed(() =>
    containerLabels(manufactured_medication.value?.form || '')
  )

  const total_quantity = computed(() =>
    container_size.value * number_of_containers.value
  )

  const total_quantity_label_end = computed(() => {
    if (!manufactured_medication.value) return ''
    return ` (${denominatorPlural(manufactured_medication.value)})`
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
          name={`${props.name}.strength`}
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
      <FormRow>
        <AsyncSearch
          href='/app/procurers'
          name='procured_from'
          label='Procured From'
          value={props.last_procurement
            ? {
              id: props.last_procurement.procurer_id,
              name: props.last_procurement.procurer_name,
            }
            : null}
          required
          addable
        />
        <TextInput
          name='batch_number'
          value={props.last_procurement?.batch_number}
        />
        <DateInput name='expiry_date' min={props.today} />
      </FormRow>
      <FormRow>
        <NumberInput
          name='container_size'
          label={container_labels.value.size}
          value={container_size.value}
          min={1}
          required
          onInput={(e) => container_size.value = Number(e.target.value) || 0}
        />
        <NumberInput
          name='number_of_containers'
          label={container_labels.value.number_of}
          value={number_of_containers.value}
          min={1}
          required
          onInput={(e) =>
            number_of_containers.value = Number(e.target.value) || 0}
        />
        <NumberInput
          name='quantity'
          label={`Total Quantity${total_quantity_label_end.value}`}
          value={total_quantity.value}
          readonly
          min={1}
          required
        />
      </FormRow>
    </div>
  )
}
