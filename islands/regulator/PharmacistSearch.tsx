import { assert } from 'std/assert/assert.ts'
import PersonSearch from '../PersonSearch.tsx'

export function PharmacistSearch() {
  return (
    <PersonSearch
      name='given_name'
      href={`/regulator/pharmacists/pharmacists`}
      label=''
      addable
      optionHref={(pharmacist) => {
        if (pharmacist.id === 'add') {
          return `/regulator/pharmacists/invite?pharmacist_name=${pharmacist.name}`
        }
        assert(pharmacist.href, 'Rendered pharmacist should have an href')
        return pharmacist.href
      }}
    />
  )
}
