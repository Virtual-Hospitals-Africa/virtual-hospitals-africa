import Form from '../library/Form.tsx'
import { DateInput, TextInput } from '../../islands/form/Inputs.tsx'
import FormRow from '../library/FormRow.tsx'
import FormButtons from '../../islands/form/buttons.tsx'
import PersonSearch from '../../islands/PersonSearch.tsx'

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
          search_route='/app/patients?completed_intake=true'
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
