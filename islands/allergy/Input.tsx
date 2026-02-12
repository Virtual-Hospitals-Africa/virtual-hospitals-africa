// TODO: rewrite with proper type that extends OptionLike
// import { useSignal } from '@preact/signals'
// import { SnomedConceptSearchResult } from '../../types.ts'
// import AsyncSearch from '../AsyncSearch.tsx'
//
// export default function AllergyInput(props: {
//   patient_allergies: SnomedConceptSearchResult[]
// }) {
//   const patient_allergies = useSignal(props.patient_allergies)
//
//   return (
//     <AsyncSearch
//       id='allergy_search'
//       search_route='/app/snomed/allergies'
//       multi
//       signal={patient_allergies}
//     />
//   )
// }
