// import { useSignal } from '@preact/signals'
// import { PencilIcon } from '../../components/library/icons/heroicons/solid.tsx'
// import { HiddenInput } from '../../components/library/HiddenInput.tsx'
// import { TextArea } from '../form/inputs/textarea.tsx'
// import PriorityDropdown from './PriorityDropdown.tsx'
// import { ReferenceRangeIndicator, SimpleReferenceRangeIndicatorProps } from '../../components/vitals/SimpleReferenceRangeIndicator.tsx'

// type VitalsTableRowProps = {
//   measurement: {
//     finding_id: string
//     snomed_concept_id: string
//     value_display: string | null
//     evaluation: null | {
//       note: string | null

//     }
//   }
//   range: SimpleReferenceRangeIndicatorProps
//   previous_value?: number
//   previous_display?: string
//   system_evaluation: string
//   is_computed: boolean
//   is_component_of_computed: boolean
//   vitalDisplayName: string
// }

// export default function VitalsTableRow({
//   measurement,
//   range,
//   previous_value,
//   previous_display,
//   system_evaluation,
//   is_computed,
//   is_component_of_computed,
//   vitalDisplayName,
// }: VitalsTableRowProps) {
//   const name = `findings.${measurement.record_id}`
//   const has_existing_note = !!measurement.evaluation?.note
//   const show_note = useSignal(has_existing_note)
//   const value = measurement.value_display ? parseFloat(measurement.value_display) : NaN

//   return (
//     <>
//       <tr className={is_component_of_computed ? 'bg-gray-50' : ''}>
//         <td
//           className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
//             is_computed ? 'font-bold' : 'font-normal'
//           } ${is_component_of_computed ? 'pl-10' : ''}`}
//         >
//           {vitalDisplayName}
//         </td>
//         <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
//           {measurement.value_display}
//         </td>
//         <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
//           {previous_display || '-'}
//         </td>
//         <td className='px-6 py-4'>
//           {range && !isNaN(value)
//             ? (
//               <ReferenceRangeIndicator
//                 value={value}
//                 previous_value={previous_value}
//                 normal_min={range.normal_min}
//                 normal_max={range.normal_max}
//                 critical_min={range.critical_min}
//                 critical_max={range.critical_max}
//                 units={range.units}
//               />
//             )
//             : (
//               <span className='text-gray-500 text-sm'>
//                 No range available
//               </span>
//             )}
//         </td>
//         <td className='px-6 py-4 whitespace-nowrap'>
//           <span
//             className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//               system_evaluation === 'CRITICAL'
//                 ? 'bg-red-100 text-red-800'
//                 : system_evaluation === 'Abnormal'
//                 ? 'bg-yellow-100 text-yellow-800'
//                 : 'bg-green-100 text-green-800'
//             }`}
//           >
//             {system_evaluation}
//           </span>
//         </td>
//         <td className='px-6 py-4 whitespace-nowrap'>
//           <div className='flex items-center gap-2'>
//             <PriorityDropdown
//               name={name}
//               vitalName={vitalDisplayName}
//               initialPriority={measurement.evaluation?.priority}
//             />
//           </div>
//         </td>
//         <td className='px-6 py-4 whitespace-nowrap'>
//           <div className='flex items-center gap-2'>
//             <button
//               type='button'
//               onClick={() => (show_note.value = !show_note.value)}
//               className={`inline-flex items-center justify-center size-10 border rounded-md cursor-pointer hover:bg-gray-50 ${
//                 show_note.value
//                   ? 'border-blue-500 bg-blue-50 text-blue-700'
//                   : 'border-gray-300'
//               }`}
//               title={`Add note for ${vitalDisplayName}`}
//             >
//               <PencilIcon
//                 className={`size-4 ${
//                   show_note.value ? 'text-blue-600' : 'text-gray-400'
//                 }`}
//               />
//             </button>
//             <HiddenInput
//               name={`${name}.snomed_concept_id`}
//               value={measurement.snomed_concept_id}
//             />
//             <HiddenInput
//               name={`${name}.finding_id`}
//               value={measurement.record_id}
//             />
//           </div>
//         </td>
//       </tr>
//       {show_note.value && (
//         <tr>
//           <td colSpan={7} className='px-6 py-4 bg-gray-50'>
//             <div className='max-w-2xl'>
//               <TextArea
//                 name={`${name}.note`}
//                 label='Clinical Notes'
//                 placeholder={`Add clinical notes for ${vitalDisplayName}...`}
//                 rows={3}
//                 value={measurement.evaluation?.note || ''}
//               />
//             </div>
//           </td>
//         </tr>
//       )}
//     </>
//   )
// }
