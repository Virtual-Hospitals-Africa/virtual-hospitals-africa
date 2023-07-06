import { DateInput } from '../components/library/form/Inputs.tsx'
import FormButtons from '../components/library/form/buttons.tsx'
import PersonSearch from './PersonSearch.tsx'

export default function ScheduleForm() {
  return (
    <>
      <form method='POST'>
        <PersonSearch
          name='patient'
          href='/app/patients'
        />
        {
          /* <PersonSearch
          name='health_worker'
          href='/app/health_workers'
        /> */
        }
        <DateInput />
        <FormButtons submitText='Available Times' />
      </form>
    </>
  )
}
