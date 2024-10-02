import PersonSearch from '../PersonSearch.tsx'

export function AddPatientSearch({
  organization_id,
  address,
}: {
  organization_id: string
  address: string | undefined | null
}) {
  const isAddressValid = address !== undefined && address !== null

  return (
    <PersonSearch
      name='patient'
      search_route={`/app/organizations/${organization_id}/patients`}
      label=''
      addable={isAddressValid}
      addHref={isAddressValid
        ? `/app/organizations/${organization_id}/waiting_room/add?patient_name=`
        : undefined}
    />
  )
}
