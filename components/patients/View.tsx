import { RenderedPatient } from '../../types.ts'
import { Button } from '../library/Button.tsx'
import { SearchInput } from '../../islands/form/Inputs.tsx'
import FormRow from '../../islands/form/Row.tsx'
import PatientsTable from './Table.tsx'
import PatientCards from '../../islands/patient-cards.tsx'

export default function PatientsView(
  { patients }: { patients: RenderedPatient[] },
) {
  return (
    <>
      <FormRow className='mb-4'>
        <SearchInput />
        <Button
          type='submit'
          className='w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
        >
          Invite
        </Button>
      </FormRow>

      <PatientCards
        patients={patients}
        className='flex sm:hidden'
      />
      <PatientsTable patients={patients} />
    </>
  )
}
