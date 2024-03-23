import { JSX } from 'preact'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Form from '../form/Form.tsx'
import FormRow from '../form/Row.tsx'
import { Button } from '../../components/library/Button.tsx'
import { DateInput, NumberInput } from '../form/Inputs.tsx'
import ProcurerSearch from './ProcurerSearch.tsx'
import ManufacturedMedicationInput from '../manufactured_medication/Input.tsx'
import { ManufacturedMedicationSearchResult } from '../../types.ts'

export default function InventoryMedicineForm(
  { today, manufactured_medication, strength }: {
    today: string
    manufactured_medication: null | ManufacturedMedicationSearchResult
    strength: null | number
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
              strength={strength}
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
                min={1}
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
