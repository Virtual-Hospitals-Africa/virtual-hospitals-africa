import PersonSearch from '../PersonSearch.tsx'

export function InvitePharmacistSearch() {
  return (
    <PersonSearch
      name='pharmacist'
      href='/regulator/pharmacists/pharmacists'
      label=''
      addable
      addHref='/regulator/pharmacists/invite?pharmacist_name='
      optionHref={(pharmacist) =>
        `/regulator/pharmacists/invite?pharmacist_id=${pharmacist.id}`}
    />
  )
}
