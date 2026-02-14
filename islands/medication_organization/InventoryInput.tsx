import { computed, useSignal } from '@preact/signals'
import { Maybe, RenderedOrganizationMedication } from '../../types.ts'
import FormRow from '../../components/library/FormRow.tsx'
import { MedicationOrganizationSearch } from './Search.tsx'
import AsyncSearch from '../AsyncSearch.tsx'
import { containerLabels } from '../../shared/prescription.ts'
import { DateInput } from '../form/inputs/date.tsx'
import { NumberInput } from '../form/inputs/number.tsx'
import { TextInput } from '../form/inputs/text.tsx'

export default function MedicationOrganizationInventoryInput(props: {
  organization_id: string
  name: string
  medication: null | RenderedOrganizationMedication
  last_procurement?: Maybe<{
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

  const container_size = useSignal(props.last_procurement?.container_size ?? 0)
  const number_of_containers = useSignal(
    props.last_procurement?.number_of_containers ?? 0,
  )

  const container_labels = computed(() => containerLabels(medication.value?.form || ''))

  const total_quantity = computed(() => container_size.value * number_of_containers.value)

  return (
    <div className='w-full justify-normal'>
      <FormRow className='w-full justify-normal'>
        <MedicationOrganizationSearch
          organization_id={props.organization_id}
          label='Medication'
          name={props.name}
          value={medication.value}
          required
          onSelect={(value) => {
            medication.value = value ?? null
          }}
        />
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
          label='Total Quantity'
          value={total_quantity.value}
          readonly
          min={1}
          required
        />
      </FormRow>
    </div>
  )
}
