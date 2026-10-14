import { RenderedWaitingRoom } from '../../types.ts'
import WaitingRoomTable from './Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../library/FormRow.tsx'
import { AddPatientSearch } from '../../islands/waiting_room/AddPatientSearch.tsx'
import { PlusIcon } from '../library/icons/heroicons/solid.tsx'

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
          <form
            method='POST'
            action={`/app/organizations/${organization_id}/patients/start-registration`}
            id='start-registration'
            className='max-md:self-center'
          >
            <Button
              size='md'
              type='submit'
              title='Register patient'
              aria-label='Register patient'
              className='w-max h-full rounded-lg border-0 text-gray-900  placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-700 sm:leading-5 p-2 self-end whitespace-nowrap grid place-items-center max-md:size-12 max-md:self-center max-md:p-0'
            >
              <PlusIcon aria-hidden='true' className='md:-ml-1' />
              <span className='hidden md:inline'>Register patient</span>
            </Button>
          </form>
        )}
      </FormRow>
      <WaitingRoomTable
        waiting_room={waiting_room}
        can_register_patients={can_register_patients}
      />
    </>
  )
}
