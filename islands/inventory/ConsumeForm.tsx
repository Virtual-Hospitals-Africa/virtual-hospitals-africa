import { JSX } from 'preact'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Form from '../form/Form.tsx'
import FormRow from '../form/Row.tsx'
import { Button } from '../../components/library/Button.tsx'
import { NumberInput } from '../form/Inputs.tsx'

export default function FacilityConsumableForm(): JSX.Element {
  return (
    <div>
      <SectionHeader className='my-5 text-[20px]'>
        Consume Item
      </SectionHeader>
      <div>
        <Form method='post'>
          <div className='flex flex-col w-full gap-2'>
            <FormRow>
              <NumberInput
                name='quantity'
                label='Quantity'
                required
              />
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
