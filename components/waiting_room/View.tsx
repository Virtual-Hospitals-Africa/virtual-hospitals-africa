import { RenderedWaitingRoom } from '../../types.ts'
import { Button } from '../library/Button.tsx'
import { Container } from '../library/Container.tsx'
import { SearchInput } from '../library/form/Inputs.tsx'
import FormRow from '../library/form/Row.tsx'
import WaitingRoomEmptyState from './EmptyState.tsx'
import WaitingRoomTable from './Table.tsx'

function NonEmptyWaitingRoomView(
  { waiting_room, add_href }: {
    waiting_room: RenderedWaitingRoom[]
    add_href: string
  },
) {
  return (
    <>
      <FormRow className='mb-4'>
        <form className='w-full'>
          <SearchInput />
        </form>
        <Button
          type='button'
          href={add_href}
          className='w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
        >
          Add Patient
        </Button>
      </FormRow>

      <WaitingRoomTable waiting_room={waiting_room} />
    </>
  )
}

export default function WaitingRoomView(
  { waiting_room, facility_id }: {
    waiting_room: RenderedWaitingRoom[]
    facility_id: number
  },
) {
  const add_href = `/app/facilities/${facility_id}/waiting_room/add`
  return (
    <Container size='lg'>
      {waiting_room.length
        ? (
          <NonEmptyWaitingRoomView
            waiting_room={waiting_room}
            add_href={add_href}
          />
        )
        : <WaitingRoomEmptyState add_href={add_href} />}
    </Container>
  )
}
