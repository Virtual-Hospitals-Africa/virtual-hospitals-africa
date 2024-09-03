import Form from '../library/Form.tsx'
import { DateInput, TextInput } from '../../islands/form/Inputs.tsx'
import FormRow from '../../islands/form/Row.tsx'
import FormButtons from '../../islands/form/buttons.tsx'
import PersonSearch from '../../islands/PersonSearch.tsx'

export default function ScheduleForm({ className }: { className?: string }) {
  return (
    <Form className={className}>
      <FormRow>
        <PersonSearch
          name='patient'
          search_route='/app/patients'
          required
        />
      </FormRow>
      <FormRow>
        <PersonSearch
          name='provider'
          search_route='/app/providers'
        />
      </FormRow>
      <FormRow>
        <DateInput className='w-full' />
      </FormRow>
      <FormRow>
        <TextInput name='reason' required />
      </FormRow>
      <FormButtons
        className='mt-4'
        submitText='Next Available'
      />
    </Form>
  )
}
