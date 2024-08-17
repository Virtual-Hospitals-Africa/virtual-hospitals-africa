import PersonSearch from '../PersonSearch.tsx'

export function InvitePharmacySearch() {
  return (
    <PersonSearch
      name='name'
      href='/regulator/pharmacies/pharmacies'
      label=''
      addable
      addHref='/regulator/pharmacies/invite?pharmacy_name='
    />
  )
}
