import { JSX } from 'preact'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Form from '../../components/library/Form.tsx'
import FormRow from '../form/Row.tsx'
import { Button } from '../../components/library/Button.tsx'
import { DateInput, NumberInput } from '../form/Inputs.tsx'
import AsyncSearch from '../AsyncSearch.tsx'
import { RenderedConsumable } from '../../types.ts'

export default function FacilityConsumableForm(
  { today, consumable }: {
    today: string
    consumable: RenderedConsumable | null
  },
): JSX.Element {
  return (
    <div>
      <SectionHeader className='my-5 text-[20px]'>
        Add Consumable
      </SectionHeader>
      <div>
        <Form method='post'>
          <div className='flex flex-col w-full gap-2'>
            <FormRow>
              <AsyncSearch
                href='/app/consumables'
                name='consumable'
                label='Consumable'
                required
                addable
                value={consumable}
              />
              <AsyncSearch
                href='/app/procurers'
                name='procured_from'
                label='Procured From'
                required
                addable
              />
            </FormRow>
            <FormRow>
              <NumberInput
                name='quantity'
                label='Quantity'
                min={1}
                required
              />
              <DateInput name='expiry_date' min={today} />
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
