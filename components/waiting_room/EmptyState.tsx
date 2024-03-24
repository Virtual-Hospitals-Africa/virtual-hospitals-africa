import { EmptyState } from '../library/EmptyState.tsx'
import AddPatientIcon from '../library/icons/AddPatient.tsx'

export default function WaitingRoomEmptyState(
  { add_href }: { add_href: string },
) {
  return (
    <EmptyState
      header='There are no patients in the waiting room'
      explanation='Add a patient'
      icon={<AddPatientIcon className='mx-auto h-12 w-12 text-gray-400' />}
      button={{
        text: 'Add patient',
        href: add_href,
      }}
    />
  )
}
