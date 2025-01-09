import PersonSearch from '../PersonSearch.tsx'

export function AddPatientSearch({
  organization_id,
  can_add_patients,
}: {
  organization_id: string
  can_add_patients: boolean
}) {
  return (
    <PersonSearch
      name='patient'
      search_route={`/app/organizations/${organization_id}/patients`}
      label=''
      addable={can_add_patients && {
        href:
          `/app/organizations/${organization_id}/patients/intake?patient_name=`,
      }}
    />
  )
}
