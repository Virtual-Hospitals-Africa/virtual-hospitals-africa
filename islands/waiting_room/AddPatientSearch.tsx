import { assert } from 'std/assert/assert.ts'
import { RenderedWaitingRoom } from '../../types.ts'
import PersonSearch from '../PersonSearch.tsx'

export function AddPatientSearch({ organization_id, waiting_room }: {
  organization_id: number
  waiting_room: RenderedWaitingRoom[]
}) {
  return (
    <PersonSearch
      name='patient'
      href={`/app/organizations/${organization_id}/patients`}
      label=''
      addable
      optionHref={(patient) => {
        if (patient.id === 'add') {
          return `/app/organizations/${organization_id}/waiting_room/add?patient_name=${patient.name}`
        }
        assert(patient.href, 'Rendered patient should have an href')
        return patient.href
      }}
    />
  )
}
