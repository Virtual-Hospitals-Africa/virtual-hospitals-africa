import { SearchInput } from '../components/library/form/Inputs.tsx'
import FormButtons from '../components/library/form/buttons.tsx'

export default function ScheduleForm() {
  return (
    <form method='POST'>
      {/* <PatientSearch /> */}
      <SearchInput name='patient' />
      <FormButtons />
    </form>
  )
}
