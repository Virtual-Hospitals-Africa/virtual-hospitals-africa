import AsyncSearch from '../AsyncSearch.tsx'

export function PharmacySearch() {
  return (
    <AsyncSearch
      name='name'
      href={`/regulator/pharmacies/pharmacies`}
      label=''
    />
  )
}
