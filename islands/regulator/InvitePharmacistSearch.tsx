import PersonSearch from '../PersonSearch.tsx'

export function InvitePharmacistSearch() {
  return (
    <PersonSearch
      name='pharmacist'
      search_route='/regulator/pharmacists/pharmacists'
      label=''
      addable={{
        href: '/regulator/pharmacists/invite?pharmacist_name=',
      }}
      optionHref={(pharmacist) =>
        `/regulator/pharmacists/invite?pharmacist_id=${pharmacist.id}`}
    />
  )
}
