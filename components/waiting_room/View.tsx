import { RenderedWaitingRoom } from '../../types.ts'
import WaitingRoomTable from './Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../../islands/form/Row.tsx'
import { AddPatientSearch } from '../../islands/waiting_room/AddPatientSearch.tsx'

export default function WaitingRoomView(
  { waiting_room, organization_id }: {
    waiting_room: RenderedWaitingRoom[]
    organization_id: number
  },
) {
  const add_href = `/app/organizations/${organization_id}/waiting_room/add`
  return (
    <>
      <FormRow className='mb-4'>
        <AddPatientSearch
          organization_id={organization_id}
          waiting_room={waiting_room}
        />
        <Button
          type='button'
          href={add_href}
          className='w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
        >
          Add Patient
        </Button>
      </FormRow>
      <WaitingRoomTable waiting_room={waiting_room} add_href={add_href} />
    </>
  )
}
