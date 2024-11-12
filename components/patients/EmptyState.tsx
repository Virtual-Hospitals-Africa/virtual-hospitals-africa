import { EmptyState } from '../library/EmptyState.tsx'
import { AddPatientIcon } from '../library/icons/AddPatient.tsx'

export default function PatientsEmptyState() {
  return (
    <EmptyState
      header='No patients'
      explanation='Add a patient'
      icon={<AddPatientIcon className='mx-auto h-12 w-12 text-gray-400' />}
      button={{
        children: 'Add patient',
        href: '/app/patients/add',
      }}
    />
  )
}
