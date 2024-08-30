import PersonSearch from '../PersonSearch.tsx'

export function AddPatientSearch({ organization_id }: {
  organization_id: string
}) {
  return (
    <PersonSearch
      name='patient'
      search_route={`/app/organizations/${organization_id}/patients`}
      label=''
      addable
      addHref={`/app/organizations/${organization_id}/waiting_room/add?patient_name=`}
    />
  )
}
