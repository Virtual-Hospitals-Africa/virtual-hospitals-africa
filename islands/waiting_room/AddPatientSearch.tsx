import { assert } from 'std/assert/assert.ts'
import { RenderedWaitingRoom } from '../../types.ts'
import PersonSearch from '../PersonSearch.tsx'

export function AddPatientSearch({ facility_id, waiting_room }: {
  facility_id: number
  waiting_room: RenderedWaitingRoom[]
}) {
  return (
    <PersonSearch
      name='patient'
      href={`/app/facilities/${facility_id}/patients`}
      label=''
      addable
      optionHref={(patient) => {
        if (patient.id === 'add') {
          return `/app/facilities/${facility_id}/waiting_room/add?patient_name=${patient.name}`
        }
        assert(patient.href, 'Rendered patient should have an href')
        return patient.href
      }}
    />
  )
}
