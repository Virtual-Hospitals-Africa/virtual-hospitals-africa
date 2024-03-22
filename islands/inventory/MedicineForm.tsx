import { JSX } from 'preact'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Form from '../form/Form.tsx'
import FormRow from '../form/Row.tsx'
import { Button } from '../../components/library/Button.tsx'
import { DateInput, NumberInput } from '../form/Inputs.tsx'
import ProcurerSearch from './ProcurerSearch.tsx'
import MedicationInput from '../medication/Input.tsx'

export default function InventoryMedicineForm(): JSX.Element {
  return (
    <div>
      <SectionHeader className='my-5 text-[20px]'>
        Add Medicine
      </SectionHeader>
      <div>
        <Form method='post'>
          <div className='flex flex-col w-full gap-2'>
            <MedicationInput
              name={`medication`}
              showIntake={false}
            />
            <FormRow>
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
              <DateInput name={'expiry_date'} />
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
