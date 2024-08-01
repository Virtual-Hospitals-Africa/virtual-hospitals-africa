import AsyncSearch from '../AsyncSearch.tsx'

export function PharmacySearch() {
  return (
    <AsyncSearch
      name='name'
      href={`/regulator/pharmacies/pharmacies`}
      label=''
      addable
      optionHref={(pharmacy) => {
        if (pharmacy.id === 'add') {
          return `/regulator/pharmacies`
        }
        return `/regulator/pharmacies/pharmacies`
      }}
    />
  )
}
