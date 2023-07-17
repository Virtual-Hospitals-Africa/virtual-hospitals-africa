import { Patient, ReturnedSqlRow } from '../../types.ts'
import { Button } from '../library/Button.tsx'
import { Container } from '../library/Container.tsx'
import { SearchInput } from '../library/form/Inputs.tsx'
import FormRow from '../library/form/Row.tsx'
import PatientsEmptyState from './EmptyState.tsx'
import PatientsTable from './Table.tsx'
import PatientCards from '../../islands/patient-cards.tsx'
import { Patient as PatientData } from '../../components/patients/Table.tsx'

function attachAvatarUrl(
  patients: ReturnedSqlRow<Patient & { name: string }>[],
): PatientData[] {
  return patients.map((patient) => ({
    ...patient,
    avatar_url: patient.avatar_media_id
      ? `/app/patients/${patient.id}/avatar`
      : undefined,
  }))
}

function NonEmptyPatientsView(
  { patients }: { patients: ReturnedSqlRow<Patient & { name: string }>[] },
) {
  const patientsWithAvatarUrl = attachAvatarUrl(patients)
  return (
    <>
      <FormRow className='mb-4'>
        <form className='w-full'>
          <SearchInput />
        </form>
        <Button
          type='button'
          href='/app/patients/add'
          className='block w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
        >
          Add Patient
        </Button>
      </FormRow>

      <PatientCards
        patients={patientsWithAvatarUrl}
        className='flex sm:hidden'
      />
      <PatientsTable patients={patientsWithAvatarUrl} />
    </>
  )
}

export default function PatientsView(
  { patients }: { patients: ReturnedSqlRow<Patient & { name: string }>[] },
) {
  return (
    <Container size='lg'>
      {patients.length
        ? <NonEmptyPatientsView patients={patients} />
        : <PatientsEmptyState />}
    </Container>
  )
}
