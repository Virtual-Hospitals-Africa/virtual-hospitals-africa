import { Allergy } from '../../types.ts'
import AsyncSearch from '../AsyncSearch.tsx'

export default function AllergySearch({ add }: {
  add(allergy: Allergy): void
}) {
  return (
    <AsyncSearch
      multi
      search_route='/app/snomed/allergies'
      onSelect={(
        allergy: Allergy & { id: string; name: string } | undefined,
      ) => {
        if (allergy) {
          add(allergy as unknown as Allergy)
        }
      }}
    />
  )
}
