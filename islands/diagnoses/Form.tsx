// import { DiagnosisGroup, Maybe } from '../../types.ts'
// import { JSX } from 'preact'
// import { AddRow } from '../AddRemove.tsx'
// import DiagnosisFormRow, { DiagnosisFormRowState } from './FormRow.tsx'
// import { Signal, useSignal } from '@preact/signals'
// import { AgreeDisagreeQuestion } from '../form/inputs/agree_disagree.tsx'
// import { TextInput } from '../form/inputs/text.tsx'

// type SelfDiagnosesFormState = Array<
//   DiagnosisFormRowState | { removed: true }
// >

// type OthersDiagnosesFormState = Array<
//   {
//     id?: string
//     diagnosis_id?: string
//     approval?: Maybe<'agree' | 'disagree'>
//     disagree_reason?: Maybe<string>
//   }
// >

// export default function DiagnosesForm(props: {
//   diagnoses: DiagnosisGroup
//   earliestSymptomDate?: string
// }): JSX.Element {
//   const self_diagnoses: Signal<SelfDiagnosesFormState> = useSignal<
//     SelfDiagnosesFormState
//   >(
//     props.diagnoses.self,
//   )

//   const others_diagnoses: Signal<OthersDiagnosesFormState> = useSignal<
//     OthersDiagnosesFormState
//   >(
//     props.diagnoses.others,
//   )

//   const addDiagnosis = () => {
//     const new_diagnosis = {
//       comorbidities: [],
//       medications: [],
//       start_date: props.earliestSymptomDate ||
//         new Date().toISOString().split('T')[0], // default to earliest date or today
//     }

//     self_diagnoses.value = [...self_diagnoses.value, new_diagnosis]
//   }

//   const first_not_removed = self_diagnoses.value.find(
//     (d) => !d.removed,
//   )

//   return (
//     <section className='flex flex-col gap-4'>
//       {others_diagnoses.value.length > 0 && (
//         <div>
//           <h3 className='text-sm font-semibold text-gray-900'>
//             Made by others
//           </h3>
//           <div className='flex flex-col gap-3'>
//             {others_diagnoses.value.map((state, index) => {
//               return (
//                 <div className='flex gap-2' key={index}>
//                   <AgreeDisagreeQuestion
//                     name={`diagnoses_collaborations.${index}.approval`}
//                     onChange={(approval) => {
//                       others_diagnoses.value = others_diagnoses.value.map((
//                         diagnosis,
//                         j,
//                       ) => j === index ? { ...diagnosis, approval } : diagnosis)
//                     }}
//                     value={state.id
//                       ? others_diagnoses.value.find((od) => od.id === state.id)
//                         ?.approval
//                       : null}
//                   />
//                   <input
//                     type='hidden'
//                     name={`diagnoses_collaborations.${index}.diagnosis_id`}
//                     value={state.diagnosis_id}
//                   />
//                   <div className='flex flex-col gap-2'>
//                     <p>
//                       {props.diagnoses.others[index].name} since {props.diagnoses.others[index].start_date}{' '}
//                       <span className='italic'>
//                         diagnosed by Dr. {props.diagnoses.others[index].diagnosed_by} {props.diagnoses.others[index].diagnosed_at}
//                       </span>
//                     </p>
//                     {state.id && state.approval === 'disagree' && (
//                       <TextInput
//                         name={`diagnoses_collaborations.${index}.disagree_reason`}
//                         label=''
//                         placeholder='Reason why you disapproval'
//                         value={state.id
//                           ? others_diagnoses.value.find((od) => od.id === state.id)
//                             ?.disagree_reason
//                           : null}
//                         onInput={(event) => {
//                           others_diagnoses.value = others_diagnoses.value.map((
//                             diagnosis,
//                             j,
//                           ) =>
//                             j === index
//                               ? {
//                                 ...diagnosis,
//                                 disagree_reason: event.currentTarget.value,
//                               }
//                               : diagnosis
//                           )
//                         }}
//                         required
//                       />
//                     )}
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       )}
//       <div className='flex flex-col gap-3'>
//         {others_diagnoses.value.length > 0 && (
//           <h3 className='text-sm font-semibold text-gray-900'>
//             Made by you
//           </h3>
//         )}
//         {self_diagnoses.value.map((
//           state,
//           index,
//         ) =>
//           !state.removed && (
//             <DiagnosisFormRow
//               index={index}
//               state={state}
//               labelled={first_not_removed === state}
//               value={state.id
//                 ? props.diagnoses.self.find(
//                   (diagnosis) => diagnosis.id === state.id,
//                 )
//                 : undefined}
//               earliestSymptomDate={props.earliestSymptomDate}
//               remove={() =>
//                 self_diagnoses.value = self_diagnoses.value.map((
//                   diagnosis,
//                   j,
//                 ) => j === index ? { removed: true } : diagnosis)}
//               update={(updatedDiagnosis) =>
//                 self_diagnoses.value = self_diagnoses.value.map((
//                   diagnosis,
//                   j,
//                 ) => j === index ? updatedDiagnosis : diagnosis)}
//             />
//           )
//         )}
//         <AddRow
//           text='Add Diagnosis'
//           onClick={addDiagnosis}
//         />
//       </div>
//     </section>
//   )
// }
