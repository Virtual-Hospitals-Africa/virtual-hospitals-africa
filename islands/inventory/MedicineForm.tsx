import { JSX } from 'preact'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Form from '../form/Form.tsx'
import FormRow from '../form/Row.tsx'
import { Button } from '../../components/library/Button.tsx'
import { DateInput, NumberInput, TextInput } from '../form/Inputs.tsx'
import ManufacturedMedicationInput from '../manufactured_medication/Input.tsx'
import { ManufacturedMedicationSearchResult } from '../../types.ts'
import AsyncSearch from '../AsyncSearch.tsx'
import { useSignal } from '@preact/signals'

export default function InventoryMedicineForm(
  { today, value }: {
    today: string
    value: {
      strength: null | number
      quantity: null | number
      container_size: null | number
      number_of_containers: null | number
      procurer_id: null | number
      procurer_name: null | string
      batch_number: null | string
      manufactured_medication: null | ManufacturedMedicationSearchResult
    }
  },
): JSX.Element {
  const manufactured_medication = useSignal(value.manufactured_medication)
  const container = useSignal({
    size: value.container_size ?? 0,
    total: value.number_of_containers,
  })

  const getContainerTitle = (form: string) => {
    switch ((form ?? '').toLocaleLowerCase()) {
      case 'tablet':
      case 'tablet, coated':
      case 'capsule':
        return { size: 'Tablets per box', total: 'Total boxes' }
      case 'solution':
      case 'injectable':
        return { size: 'Bottle size', total: 'Number of bottles' }
      default:
        return { size: 'Container size', total: 'Number of Containers' }
    }
  }

  return (
    <div>
      <SectionHeader className='my-5 text-[20px]'>
        Add Medicine
      </SectionHeader>
      <div>
        <Form method='post'>
          <div className='flex flex-col w-full gap-2'>
            <ManufacturedMedicationInput
              name='manufactured_medication'
              manufactured_medication={value.manufactured_medication}
              strength={value.strength}
              onSelect={(medication) => {
                manufactured_medication.value = medication
              }}
              onStrengthSelect={(strength) => {
                if (
                  ['solution', 'injectable'].includes(
                    (manufactured_medication.value?.form! ?? '')
                      .toLocaleLowerCase(),
                  )
                ) {
                  container.value = {
                    size: strength!,
                    total: container.value.total,
                  }
                }
              }}
            />
            <FormRow>
              <AsyncSearch
                href='/app/procurers'
                name='procured_from'
                label='Procured From'
                value={{
                  id: value.procurer_id,
                  name: value.procurer_name ?? '',
                }}
                required
                addable
              />
              <TextInput name='batch_number' value={value.batch_number ?? ''} />
              <DateInput name='expiry_date' min={today} />
            </FormRow>

            {manufactured_medication.value && (
              <FormRow>
                <NumberInput
                  name='container_size'
                  label={getContainerTitle(manufactured_medication.value?.form!)
                    .size}
                  value={container.value.size}
                  min={1}
                  required
                  readonly={['solution', 'injectable'].includes(
                    (manufactured_medication.value?.form!).toLocaleLowerCase(),
                  )}
                  onInput={(e) => {
                    container.value = {
                      size: Number(e.target.value),
                      total: container.value.total,
                    }
                  }}
                />
                <NumberInput
                  name='number_of_containers'
                  label={getContainerTitle(manufactured_medication.value?.form!)
                    .total}
                  value={container.value.total}
                  min={1}
                  required
                  onInput={(e) => {
                    container.value = {
                      size: container.value.size,
                      total: Number(e.target.value),
                    }
                  }}
                />
                <NumberInput
                  name='quantity'
                  label={`Total Quantity (${manufactured_medication.value.strength_denominator_unit})`}
                  value={container.value.size && container.value.total &&
                    container.value.size * container.value.total}
                  readonly
                  min={1}
                  required
                />
              </FormRow>
            )}

            <FormRow>
              <Button type='submit'>
                Submit
              </Button>
            </FormRow>
          </div>
        </Form>
      </div>
    </div>
  )
}
