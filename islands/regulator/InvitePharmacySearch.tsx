import { assert } from 'std/assert/assert.ts'
import PersonSearch from '../PersonSearch.tsx'

export function InvitePharmacySearch() {
  return (
    <PersonSearch
      name='name'
      href={`/regulator/pharmacies/pharmacies`}
      label=''
      addable
      optionHref={(pharmacy) => {
        if (pharmacy.id === 'add') {
          return `/regulator/pharmacies`
        }
        assert(pharmacy.href, 'Rendered pharmaciy should have an href')
        return pharmacy.href
      }}
    />
  )
}