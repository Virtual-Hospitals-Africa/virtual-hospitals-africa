import Form from '../library/Form.tsx'

import FormRow from '../library/FormRow.tsx'
import FormButtons from '../../islands/form/buttons.tsx'
import PersonSearch from '../../islands/PersonSearch.tsx'
import { DateInput } from '../../islands/form/inputs/date.tsx'
import { TextInput } from '../../islands/form/inputs/text.tsx'

export default function ScheduleForm(
  { className, patient_info }: {
    className?: string
    patient_info?: { id: string; name: string }
  },
) {
  return (
    <Form className={className}>
      <FormRow>
        <PersonSearch
          name='patient'
          value={patient_info}
          search_route='/app/patients?completed_registration=true'
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
