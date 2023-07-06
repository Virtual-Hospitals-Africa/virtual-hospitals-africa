import { DateInput, SearchInput } from '../components/library/form/Inputs.tsx'
import FormButtons from '../components/library/form/buttons.tsx'
import { Maybe } from '../types.ts'
import PersonSearch from './PersonSearch.tsx'

export default function ScheduleForm() {
  const patient_id: Maybe<number> = null
  const doctor_id: Maybe<number> = null
  return (
    <>
      <PersonSearch
        name='patient'
        href='/app/patients'
      />
      <SearchInput name='doctor' />

      <form method='POST'>
        {patient_id && <input type='hidden' value={patient_id} />}
        {doctor_id && <input type='hidden' value={doctor_id} />}
        <DateInput />
        <FormButtons />
      </form>
    </>
  )
}
