import SearchResults from '../components/library/SearchResults.tsx'
import { DateInput, SearchInput } from '../components/library/form/Inputs.tsx'
import FormButtons from '../components/library/form/buttons.tsx'
import { Maybe } from '../types.ts'

export default function ScheduleForm() {
  const patient_id: Maybe<number> = null
  const doctor_id: Maybe<number> = null
  return (
    <>
      {/* <PatientSearch /> */}
      <form>
        <SearchInput name='patient' />
        <SearchResults />
      </form>
      <form>
        <SearchInput name='doctor' />
      </form>

      <form method='POST'>
        {patient_id && <input type='hidden' value={patient_id} />}
        {doctor_id && <input type='hidden' value={doctor_id} />}
        <DateInput />
        <FormButtons />
      </form>
    </>
  )
}
