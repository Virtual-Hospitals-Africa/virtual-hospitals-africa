import { DateInput, TextInput } from '../components/library/form/Inputs.tsx'
import FormRow from '../components/library/form/Row.tsx'
import FormButtons from '../components/library/form/buttons.tsx'
import PersonSearch from './PersonSearch.tsx'

export default function ScheduleForm() {
  return (
    <>
      <form>
        <FormRow>
          <PersonSearch
            name='patient'
            href='/app/patients'
            required
          />
        </FormRow>
        <FormRow>
          <PersonSearch
            name='health_worker'
            href='/app/health_workers'
          />
        </FormRow>
        <FormRow>
          <DateInput />
        </FormRow>
        <FormRow>
          <TextInput name='reason' required />
        </FormRow>
        <FormButtons className='mt-4' submitText='Next Available' cancelHref='/app/calendar' />
      </form>
    </>
  )
}
