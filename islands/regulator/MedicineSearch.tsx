import AsyncSearch from '../AsyncSearch.tsx'

export function MedicineSearch() {
  return (
    <AsyncSearch
      name='name'
      href={`/regulator/medicines/medicines`}
      label=''
      addable
    />
  )
}
