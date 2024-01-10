// import { JSX } from 'preact'
// import ConditionSearch from '../ConditionSearch.tsx'
// import { DateInput } from '../../components/library/form/Inputs.tsx'
// import { PreExistingConditionWithDrugs } from '../../types.ts'
// import { RemoveRow } from '../AddRemove.tsx'
// import FormRow from '../../components/library/form/Row.tsx'

// export default function Comorbidity({
//   matchingCondition,
//   condition_prefix,
//   comorbidity_id,
//   comorbidity_index,
//   removeComorbidity,
// }: {
//   matchingCondition?: PreExistingConditionWithDrugs
//   condition_prefix: string
//   comorbidity_id: string | number
//   comorbidity_index: number
//   removeComorbidity(): void
// }): JSX.Element {
//   const matchingComorbidity = matchingCondition?.comorbidities.find(
//     (c) => c.id === comorbidity_id,
//   )
//   const prefix = `${condition_prefix}.comorbidities.${comorbidity_index}`
//   return (
//     <RemoveRow onClick={removeComorbidity} key={comorbidity_id}>
//       <FormRow>
//         <ConditionSearch
//           name={prefix}
//           value={matchingComorbidity}
//         />
//         <DateInput
//           name={`${prefix}.start_date`}
//           label={null}
//           value={matchingComorbidity?.start_date}
//         />
//         {typeof comorbidity_id === 'number' && (
//           <input
//             type='hidden'
//             name={`${prefix}.id`}
//             value={comorbidity_id}
//           />
//         )}
//       </FormRow>
//     </RemoveRow>
//   )
// }
