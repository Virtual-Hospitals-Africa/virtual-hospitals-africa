import { JSX } from 'preact'
import SectionHeader from '../library/typography/SectionHeader.tsx'
import Form from '../library/Form.tsx'
import FormRow from '../library/FormRow.tsx'
import { Button } from '../library/Button.tsx'
import MedicationInput from '../../islands/medication/Input.tsx'
import { RenderedMedication } from '../../types.ts'
import { Maybe } from '../../types.ts'

export default function InventoryMedicineForm(
  { today, medication, last_procurement }: {
    today: string
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
            <MedicationInput
              name='medication'
              medication={medication}
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
