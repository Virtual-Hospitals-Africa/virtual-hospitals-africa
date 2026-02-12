import { computed, effect, useSignal } from '@preact/signals'
import { Maybe, RenderedMedication } from '../../types.ts'
import FormRow from '../../components/library/FormRow.tsx'
import MedicationSearch from './Search.tsx'
import AsyncSearch from '../AsyncSearch.tsx'
import { containerLabels, denominatorPlural } from '../../shared/medication.ts'
import { DateInput } from '../form/inputs/date.tsx'
import { NumberInput } from '../form/inputs/number.tsx'
import { Select } from '../form/inputs/select.tsx'
import { TextInput } from '../form/inputs/text.tsx'

export default function MedicationInput(props: {
  name: string
  medication: null | RenderedMedication
  last_procurement?: Maybe<{
    strength: string
    quantity: number
    container_size: number
    number_of_containers: number
    procured_from: {
      id: string
      name: string
    }
    batch_number: null | string
  }>
  today: string
}) {
  const medication = useSignal(props.medication)
  const strength = useSignal<string | null>(
    props.last_procurement?.strength ??
      null,
  )
  const container_size = useSignal(props.last_procurement?.container_size ?? 0)
  const number_of_containers = useSignal(
    props.last_procurement?.number_of_containers ?? 0,
  )

  effect(() => {
    if (
      medication.value && !strength.value &&
      medication.value.strength_numerators.length === 1
    ) {
      strength.value = medication.value.strength_numerators[0]
    }
  })

  const container_labels = computed(() => containerLabels(medication.value?.form || ''))

  const total_quantity = computed(() => container_size.value * number_of_containers.value)

  const total_quantity_label_end = computed(() => {
    if (!medication.value) return ''
    return ` (${denominatorPlural(medication.value)})`
  })

  return (
    <div className='w-full justify-normal'>
      <FormRow className='w-full justify-normal'>
        <MedicationSearch
          label='Medication'
          name={props.name}
          value={medication.value}
          required
          onSelect={(value) => {
            medication.value = value ?? null
            strength.value = null
          }}
        />
      </FormRow>
      <FormRow className='w-full justify-normal'>
        <Select
          name={`${props.name}.strength`}
          required
          label='Strength'
          disabled={!medication.value}
          onChange={(event) => {
            if (event.currentTarget.value) {
              strength.value = event.currentTarget.value
            }
          }}
        >
          <option value=''>Select Strength</option>
          {medication.value?.strength_numerators.map((
            numerator,
          ) => (
            <option
              value={numerator.toString()}
              selected={strength.value === numerator}
            >
              {numerator.toString()}
              {medication.value!
                .strength_numerator_unit}/{medication.value!
                  .strength_denominator === '1'
                ? ''
                : medication.value!.strength_denominator}
              {medication.value!.strength_denominator_unit}
            </option>
          ))}
        </Select>
      </FormRow>
      <FormRow>
        <AsyncSearch
          search_route='/app/procurers'
          name='procured_from'
          label='Procured From'
          value={props.last_procurement?.procured_from}
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
          onInput={(e) => container_size.value = Number(e.currentTarget.value) || 0}
        />
        <NumberInput
          name='number_of_containers'
          label={container_labels.value.number_of}
          value={number_of_containers.value}
          min={1}
          required
          onInput={(e) => number_of_containers.value = Number(e.currentTarget.value) || 0}
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
