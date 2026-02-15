import { Button } from '../library/Button.tsx'
import Form from '../library/Form.tsx'
import PersonSearch from '../../islands/PersonSearch.tsx'
import FormRow from '../library/FormRow.tsx'
import { TextArea } from '../../islands/form/inputs/textarea.tsx'

export default function InviteHealthWorkerForm({
  country,
}: {
  country: string
}) {
  return (
    <Form method='POST'>
      <div className='flex flex-col w-full gap-2'>
        <FormRow>
          <label className='text-base font-semibold text-gray-900'>
            HealthWorker
          </label>
        </FormRow>
        <PersonSearch
          name='health_worker'
          search_route={`/regulator/${country}/health_workers`}
          label=''
          addable={{
            href: `/regulator/${country}/health_workers/invite?health_worker_name=`,
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
            HealthWorker Type
          </label>
        </FormRow>
        <FormRow>
          <TextArea name='health_worker_type' label='' />
        </FormRow>

        <FormRow>
          <Button type='submit' name='health_worker' value='health_worker'>
            Invite
          </Button>
        </FormRow>
      </div>
    </Form>
  )
}
