import { RenderedWaitingRoom } from '../../types.ts'
import WaitingRoomTable from './Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../library/FormRow.tsx'
import { AddPatientSearch } from '../../islands/waiting_room/AddPatientSearch.tsx'

export default function WaitingRoomView(
  { waiting_room, organization_id, can_register_patients }: {
    waiting_room: RenderedWaitingRoom[]
    organization_id: string
    can_register_patients: boolean
  },
) {
  return (
    <>
      <FormRow className='mb-4'>
        <AddPatientSearch
          organization_id={organization_id}
          waiting_room={waiting_room}
        />
        {can_register_patients && (
          <Button
            type='submit'
            method='POST'
            action={`/app/organizations/${organization_id}/patients/start-registration`}
            className='w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
          >
            Register patient
          </Button>
        )}
      </FormRow>
      <WaitingRoomTable
        waiting_room={waiting_room}
        can_register_patients={can_register_patients}
      />
    </>
  )
}
