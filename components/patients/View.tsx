import { RenderedPatientCompletedPersonal } from '../../types.ts'
import { Button } from '../library/Button.tsx'

import FormRow from '../library/FormRow.tsx'
import PatientsTable from './Table.tsx'
import PatientCards from '../../islands/patient-cards.tsx'
import { SearchInput } from '../../islands/form/inputs/search.tsx'

export default function PatientsView(
  { patients }: { patients: RenderedPatientCompletedPersonal[] },
) {
  return (
    <>
      <FormRow className='mb-4'>
        <SearchInput />
        <Button
          type='submit'
          className='grid self-end p-2 text-gray-900 border-0 rounded-md shadow-sm w-max ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 whitespace-nowrap place-items-center'
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
