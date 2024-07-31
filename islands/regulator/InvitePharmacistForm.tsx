import { assert } from 'std/assert/assert.ts'
import { Button } from '../../components/library/Button.tsx'
import Form from '../../components/library/Form.tsx'
import PersonSearch from '../PersonSearch.tsx'
import FormRow from '../form/Row.tsx'
import { TextArea } from '../form/Inputs.tsx'


export default function InvitePhamacistForm() {
    return (
        <Form method='POST'>
          <div className='flex flex-col w-full gap-2'>
            <FormRow>
              <label className='text-base font-semibold text-gray-900'>
                Pharmacist
              </label>
            </FormRow>
            <PersonSearch
              name='pharmacist'
              href={`/regulator/pharmacists`}
              label=''
              addable
              optionHref={(pharmacist) => {
                if (pharmacist.id === 'add') {
                  return `/regulator/pharmacists/invite?pharmacist_name=${pharmacist.name}`
                }
                assert(pharmacist.href, 'Rendered pharmacist should have an href')
                return pharmacist.href
              }}
            />
            <FormRow>
              <label className='text-base font-semibold text-gray-900'>
                prefix
              </label>
            </FormRow>
            <FormRow>
              <TextArea name='prefix' label='' />
            </FormRow>

            <FormRow>
              <label className='text-base font-semibold text-gray-900'>
                given_name
              </label>
            </FormRow>
            <FormRow>
              <TextArea name='given_name' label='' />
            </FormRow>

            <FormRow>
              <label className='text-base font-semibold text-gray-900'>
                family_name
              </label>
            </FormRow>
            <FormRow>
              <TextArea name='family_name' label='' />
            </FormRow>

            <FormRow>
              <label className='text-base font-semibold text-gray-900'>
                address
              </label>
            </FormRow>
            <FormRow>
              <TextArea name='address' label='' />
            </FormRow>

            <FormRow>
              <label className='text-base font-semibold text-gray-900'>
                town
              </label>
            </FormRow>
            <FormRow>
              <TextArea name='town' label='' />
            </FormRow>

            <FormRow>
              <label className='text-base font-semibold text-gray-900'>
                licence_number
              </label>
            </FormRow>
            <FormRow>
              <TextArea name='licence_number' label='' />
            </FormRow>

            <FormRow>
              <label className='text-base font-semibold text-gray-900'>
                expiry_date
              </label>
            </FormRow>
            <FormRow>
              <TextArea name='expiry_date' label='' />
            </FormRow>
              
            <FormRow>
              <label className='text-base font-semibold text-gray-900'>
                pharmacist_type
              </label>
            </FormRow>
            <FormRow>
              <TextArea name='pharmacist_type' label='' />
            </FormRow>

            <FormRow>
              <Button type='submit' name='pharmacist' value='pharmacist'>
                invite
              </Button>
            </FormRow>
         </div>
        </Form>
    )
}