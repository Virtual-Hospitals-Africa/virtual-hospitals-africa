import { RenderedWaitingRoom } from '../../types.ts'
import PersonSearch from '../PersonSearch.tsx'

export function AddPatientSearch({ facility_id, waiting_room }: {
  facility_id: number
  waiting_room: RenderedWaitingRoom[]
}) {
  return (
    <PersonSearch
      name='patient'
      href='/app/patients'
      label=''
      addable
      optionHref={(patient) => {
        if (patient.id === 'add') {
          return `/app/facilities/${facility_id}/waiting_room/add?patient_name=${patient.name}`
        }
        const patient_in_waiting_room = waiting_room.some(
          (waiting_room_entry) => waiting_room_entry.patient.id === patient?.id,
        )
        return patient_in_waiting_room
          ? `/app/patients/${patient.id}`
          : `/app/facilities/${facility_id}/waiting_room/add?patient_id=${patient.id}`
      }}
    />
  )
}
