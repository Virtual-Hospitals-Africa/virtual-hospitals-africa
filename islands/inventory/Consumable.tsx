import { JSX } from 'preact'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Form from '../form/Form.tsx'
import FormRow from '../form/Row.tsx'
import ConsumableSearch from './ConsumableSearch.tsx'
import { Button } from '../../components/library/Button.tsx'
import { DateInput, NumberInput } from '../form/Inputs.tsx'
import ProcurerSearch from './ProcurerSearch.tsx'

export default function FacilityConsumableForm(
  { today }: { today: string },
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
              <ConsumableSearch
                name='consumable'
                label='Consumable'
                required
                addable
                value={null}
              />

              <div>
                <ProcurerSearch
                  name='procured_by'
                  label='Procured by'
                  required
                  addable
                  value={null}
                />
              </div>

              <NumberInput
                name='quantity'
                label='Quantity'
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
