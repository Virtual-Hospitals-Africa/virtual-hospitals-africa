import EmptyState from '../library/EmptyState.tsx'
import MakeAppointmentIcon from '../library/icons/make-appointment.tsx'

export default function PatientsEmptyState() {
  return (
    <EmptyState
      header='No patients'
      explanation='Add a patient'
      buttonText='Add patient'
      href='/app/patients/add'
      icon={<MakeAppointmentIcon className='mx-auto h-12 w-12 text-gray-400' />}
    />
  )
}
