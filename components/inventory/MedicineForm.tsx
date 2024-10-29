import { JSX } from 'preact'
import SectionHeader from '../library/typography/SectionHeader.tsx'
import Form from '../library/Form.tsx'
import FormRow from '../library/FormRow.tsx'
import { Button } from '../library/Button.tsx'
import ManufacturedMedicationInput from '../../islands/manufactured_medication/Input.tsx'
import { RenderedManufacturedMedication } from '../../types.ts'
import { Maybe } from '../../types.ts'

export default function InventoryMedicineForm(
  { today, manufactured_medication, last_procurement }: {
    today: string
    manufactured_medication: null | RenderedManufacturedMedication
    last_procurement?: Maybe<{
      strength: number
      quantity: number
      container_size: number
      number_of_containers: number
      procured_from: {
        id: string
        name: string
      }
      batch_number: null | string
    }>
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
              manufactured_medication={manufactured_medication}
              last_procurement={last_procurement}
              today={today}
            />

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
