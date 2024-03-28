import { JSX } from 'preact'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Form from '../form/Form.tsx'
import FormRow from '../form/Row.tsx'
import { Button } from '../../components/library/Button.tsx'
import { DateInput, NumberInput, TextInput } from '../form/Inputs.tsx'
import ManufacturedMedicationInput from '../manufactured_medication/Input.tsx'
import { ManufacturedMedicationSearchResult } from '../../types.ts'
import AsyncSearch from '../AsyncSearch.tsx'

export default function InventoryMedicineForm(
  { today, value }: {
    today: string
    value: {
      strength: null | number
      quantity: null | number
      procurer_id: null | number
      procurer_name: null | string
      batch_number: null | string
      manufactured_medication: null | ManufacturedMedicationSearchResult
    }
  },
): JSX.Element {
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
              <NumberInput
                name='quantity'
                label='Quantity'
                value={value.quantity}
                min={1}
                required
              />
              <DateInput name='expiry_date' min={today} />
              <TextInput name='batch_number' value={value.batch_number ?? ''} />
            </FormRow>
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
