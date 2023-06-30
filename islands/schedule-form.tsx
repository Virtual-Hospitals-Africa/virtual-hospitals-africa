import FormButtons from '../components/library/form/buttons.tsx'
import SearchInput from './search-input.tsx'

function PatientSearch() {
  return (
    <label>
      Patient
      <input />
    </label>
  )
}

export default function ScheduleForm() {
  return (
    <form method='POST'>
      {/* <PatientSearch /> */}
      <SearchInput />
      <FormButtons />
    </form>
  )
}
