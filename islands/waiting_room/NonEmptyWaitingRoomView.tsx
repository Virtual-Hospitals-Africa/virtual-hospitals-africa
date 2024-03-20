import { RenderedWaitingRoom } from '../../types.ts'
import FormRow from '../form/Row.tsx'
import PersonSearch from '../PersonSearch.tsx'
import { Button } from '../../components/library/Button.tsx'
import WaitingRoomTable from '../../components/waiting_room/Table.tsx'
import redirect from '../../util/redirect.ts'

export default function NonEmptyWaitingRoomView(
  { waiting_room, add_href }: {
    waiting_room: RenderedWaitingRoom[]
    add_href: string
  },
) {
  return (
    <>
      <FormRow className='mb-4'>
        <form className='w-full'>
          <PersonSearch
            name='patient'
            href='/app/patients'
            label=''
            addable
            onSelect={(patient) => {
              if (patient?.id === 'add') {
                return window.location.href =
                  `/app/facilities/1/waiting_room/add?patient_name=${patient?.name}`
              }

              if (patient?.id) {
                const patient_in_waiting_room = waiting_room.find(
                  (waiting_room_entry) => {
                    return waiting_room_entry.patient.id === patient?.id
                  },
                )

                if (patient_in_waiting_room) {
                  return window.location.href = `/app/patients/${patient?.id}`
                } else {
                  return window.location.href =
                    `/app/facilities/1/waiting_room/add?patient_id=${patient?.id}`
                }
              }
            }}
          />
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
