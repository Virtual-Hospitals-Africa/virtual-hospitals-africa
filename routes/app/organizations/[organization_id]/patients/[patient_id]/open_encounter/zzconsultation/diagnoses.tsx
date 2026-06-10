export const handler = () => new Response('TODO')
// import { completeAndProceedToNextStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
// import { DiagnosesCollaboration, Diagnosis } from '../../../../../../../../types.ts'
// import FormSection from '../../../../../../../../components/library/FormSection.tsx'
// import DiagnosesForm from '../../../../../../../../islands/diagnoses/Form.tsx'
// import { diagnoses } from '../../../../../../../../db/models/diagnoses.ts'
// import { parseRequestAsserts } from '../../../../../../../../backend/parseForm.ts'
// import isObjectLike from '../../../../../../../../util/isObjectLike.ts'
// import { assertOr400 } from '../../../../../../../../util/assertOr.ts'
// import { getRequiredUUIDParam } from '../../../../../../../../util/getParam.ts'
// // import { patient_symptoms } from '../../../../../../../../db/models/patient_symptoms.ts'

// type DiagnosisData = {
//   diagnoses: Diagnosis[]
//   diagnoses_collaborations: DiagnosesCollaboration[]
// }

// function assertIsDiagnoses(
//   data: unknown,
// ): asserts data is DiagnosisData {
//   assertOr400(isObjectLike(data), 'Invalid form values')
//   if (data.diagnoses !== undefined) {
//     assertOr400(
//       Array.isArray(data.diagnoses),
//       'diagnoses must be an array',
//     )
//     for (const diagnosis of data.diagnoses) {
//       assertOr400(
//         typeof diagnosis.id === 'string',
//         'Each diagnosis must have an id of type string',
//       )
//     }
//   }
//   if (data.diagnoses_collaborations !== undefined) {
//     assertOr400(
//       Array.isArray(data.diagnoses_collaborations),
//       'diagnoses_collaborations must be an array',
//     )
//     for (const diagnoses_collaboration of data.diagnoses_collaborations) {
//       assertOr400(
//         typeof diagnoses_collaboration.id === 'string',
//         'Each diagnoses_collaboration must have an id of type string',
//       )
//     }
//   }
// }

// export const handler = {
//   async POST(ctx: OpenEncounterWorkflowContext) {
//     const req = ctx.req
//     const data = await parseRequestAsserts(
//       req,
//       assertIsDiagnoses,
//     )

//     const patient_diagnoses = (data.diagnoses || []).map((d) => ({
//       condition_id: d.id,
//       start_date: d.start_date,
//     }))

//     const diagnoses_collaborations = (data.diagnoses_collaborations || []).map(
//       (d) => ({
//         diagnosis_id: d.diagnosis_id,
//         is_approved: d.approval === 'agree',
//         disagree_reason: d.disagree_reason || null,
//       }),
//     )

//     const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

//     await diagnoses.upsertForReview(
//       ctx.state.trx,
//       {
//         patient_encounter_id: ctx.state.encounter.patient_encounter_id,
//         patient_id,
//         employment_id: ctx.state.encounter_employee_presence.employee_id,
//         diagnoses: patient_diagnoses,
//         diagnoses_collaborations,
//       },
//     )

//     const completing_step = completeAndProceedToNextStep(ctx)
//     return completing_step
//   },
// }

// export default OpenEncounterWorkflowPage(
//   async function DiagnosisPage(
//     ctx,
//   ) {
//     const patient_diagnoses = await diagnoses.getFromReview(ctx.state.trx, {
//       patient_encounter_id: ctx.state.encounter.patient_encounter_id,
//       employment_id: ctx.state.encounter_employee_presence.employee_id,
//     })
//     // const symptoms = await patient_symptoms.getEncounter(ctx.state.trx, {
//     //   patient_encounter_id: ctx.state.encounter.patient_encounter_id,
//     //   patient_id: ctx.state.encounter.patient.id,
//     // })
//     // const symptom_start_dates = symptoms.map((s) => s.start_date)

//     // let earliest_start_date: string | undefined
//     // if (symptom_start_dates.length > 0) {
//     //   earliest_start_date = symptom_start_dates.reduce((earliest, current) => {
//     //     return current < earliest ? current : earliest
//     //   })
//     // }
//     const earliest_start_date = undefined

//     return (
//       <FormSection header='Diagnoses'>
//         <DiagnosesForm
//           diagnoses={patient_diagnoses}
//           earliestSymptomDate={earliest_start_date}
//         />
//       </FormSection>
//     )
//   },
// )
