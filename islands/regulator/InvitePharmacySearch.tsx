import PersonSearch from '../PersonSearch.tsx'

export function InvitePharmacySearch() {
  return (
    <PersonSearch
      name='name'
      search_route='/regulator/pharmacies/pharmacies'
      label=''
      addable
      addHref='/regulator/pharmacies/invite?pharmacy_name='
    />
  )
}
