import Form from '../library/Form.tsx'

import FormRow from '../library/FormRow.tsx'
import FormButtons from '../../islands/form/buttons.tsx'
import PersonSearch from '../../islands/PersonSearch.tsx'
import { DateInput } from '../../islands/form/inputs/date.tsx'
import { TextInput } from '../../islands/form/inputs/text.tsx'
import { RenderedPatientCompletedRegistration } from '../../types.ts'

export default function ScheduleForm(
  { className, patient }: {
    className?: string
    patient?: RenderedPatientCompletedRegistration
  },
) {
  return (
    <Form className={className}>
      <FormRow>
        <PersonSearch
          name='patient'
          value={patient}
          search_route='/app/patients?completed_registration=true'
          required
        />
      </FormRow>
      <FormRow>
        <PersonSearch
          name='provider'
          search_route='/app/providers?roles=[doctor,nurse]'
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
