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
          search_route='/regulator/pharmacists/pharmacists'
          label=''
          addable={{
            href: '/regulator/pharmacists/invite?pharmacist_name=',
          }}
        />
        <FormRow>
          <label className='text-base font-semibold text-gray-900'>
            Prefix
          </label>
        </FormRow>
        <FormRow>
          <TextArea name='prefix' label='' />
        </FormRow>

        <FormRow>
          <label className='text-base font-semibold text-gray-900'>
            Given Name
          </label>
        </FormRow>
        <FormRow>
          <TextArea name='given_name' label='' />
        </FormRow>

        <FormRow>
          <label className='text-base font-semibold text-gray-900'>
            Family Name
          </label>
        </FormRow>
        <FormRow>
          <TextArea name='family_name' label='' />
        </FormRow>

        <FormRow>
          <label className='text-base font-semibold text-gray-900'>
            Street Address
          </label>
        </FormRow>
        <FormRow>
          <TextArea name='address' label='' />
        </FormRow>

        <FormRow>
          <label className='text-base font-semibold text-gray-900'>
            Town
          </label>
        </FormRow>
        <FormRow>
          <TextArea name='town' label='' />
        </FormRow>

        <FormRow>
          <label className='text-base font-semibold text-gray-900'>
            Licence Number
          </label>
        </FormRow>
        <FormRow>
          <TextArea name='licence_number' label='' />
        </FormRow>

        <FormRow>
          <label className='text-base font-semibold text-gray-900'>
            Expiry Date
          </label>
        </FormRow>
        <FormRow>
          <TextArea name='expiry_date' label='' />
        </FormRow>

        <FormRow>
          <label className='text-base font-semibold text-gray-900'>
            Pharmacist Type
          </label>
        </FormRow>
        <FormRow>
          <TextArea name='pharmacist_type' label='' />
        </FormRow>

        <FormRow>
          <Button type='submit' name='pharmacist' value='pharmacist'>
            Invite
          </Button>
        </FormRow>
      </div>
    </Form>
  )
}
