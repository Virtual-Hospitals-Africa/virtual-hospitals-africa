import { RenderedWaitingRoom } from '../../types.ts'
import { Container } from '../library/Container.tsx'
import WaitingRoomEmptyState from './EmptyState.tsx'
import NonEmptyWaitingRoomView from '../../islands/waiting_room/NonEmptyWaitingRoomView.tsx'

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
