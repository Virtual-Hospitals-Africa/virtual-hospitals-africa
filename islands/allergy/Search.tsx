import { Allergy } from '../../types.ts'
import AsyncSearch from '../AsyncSearch.tsx'
// import Search from '../Search.tsx'

// import { computed, useSignal } from '@preact/signals'

// NOT USED ANYMORE
// export function SyncSearch({
//   options,
//   add,
// }: {
//   options: Allergy[]
//   add(allergy: Allergy): void
// }) {
//   const query = useSignal('')
//   const filtered_options = computed(() => {
//     const query_value = query.value
//     return query_value.length > 0
//       ? options.filter((allergy) =>
//         allergy.name.toLowerCase().includes(query_value.toLowerCase())
//       )
//       : []
//   })

//   return (
//     <Search
//       multi
//       options={filtered_options.value}
//       onQuery={(new_query) => query.value = new_query}
//       onSelect={(allergy) => {
//         if (allergy) {
//           add(allergy)
//           query.value = ''
//         }
//       }}
//     />
//     // create drinksSearch
//   )
// }

export default function AllergySearch({ add }: {
  add(allergy: Allergy): void
}) {
  return (
    <AsyncSearch
      multi
      search_route='/app/snomed/allergies'
      id_field={'snomed_concept_id' as const}
      name_field={'snomed_english_term' as const}
      onSelect={(allergy: Allergy | undefined) => {
        if (allergy) {
          add(allergy as unknown as Allergy)
        }
      }}
      parse={(result) => result as unknown as Allergy}
    />
  )
}
