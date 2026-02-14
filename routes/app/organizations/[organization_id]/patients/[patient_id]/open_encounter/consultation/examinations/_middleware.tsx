export const handler = () => new Response('TODO')
// import { JSX } from 'preact'
// import { examinations } from '../../../../../../../../../db/models/examinations.ts'
// import { completeAndProceedToNextStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../../_middleware.tsx'
// import { RenderedPatientExamination } from '../../../../../../../../../types.ts'
// import { TabProps, Tabs } from '../../../../../../../../../components/library/Tabs.tsx'
// import { Progress } from '../../../../../../../../../components/library/icons/progress.tsx'
// import redirect from '../../../../../../../../../util/redirect.ts'
// import { replaceParams } from '../../../../../../../../../util/replaceParams.ts'
// import { PlusCircleIcon } from '../../../../../../../../../components/library/icons/heroicons/solid.tsx'

// type ExaminationState = {
//   patient_examinations: RenderedPatientExamination[]
//   current_examination?: RenderedPatientExamination
//   next_incomplete_examination?: RenderedPatientExamination
// }

// export type ExaminationContext = OpenEncounterWorkflowContext & {
//   state: ExaminationState
// }

// export async function handler(
//   ctx: ExaminationContext,
// ) {
//   const patient_examinations = await examinations.forPatientEncounter(
//     ctx.state.trx,
//     {
//       patient_id: ctx.state.encounter.patient.id,
//       organization_id: ctx.state.organization.id,
//       patient_encounter_id: ctx.state.encounter.patient_encounter_id,
//       consultation_step: 'examinations',
//     },
//   )

//   const next_incomplete_examination = patient_examinations.find((a) => !a.completed)

//   const { examination_slug } = ctx.params
//   const current_examination = examination_slug ? patient_examinations.find((a) => a.slug === examination_slug) : undefined

//   Object.assign(
//     ctx.state,
//     {
//       patient_examinations,
//       current_examination: current_examination!,
//       next_incomplete_examination,
//     } satisfies ExaminationState,
//   )

//   return ctx.next()
// }

// export type ExaminationPageChildProps = {
//   ctx: OpenEncounterWorkflowContext
//   previously_completed: boolean
// }

// export function completeExamination(ctx: ExaminationContext) {
//   const { next_incomplete_examination } = ctx.state
//   return next_incomplete_examination ? redirect(next_incomplete_examination.href) : completeAndProceedToNextStep(ctx)
// }

// export function ExaminationPage(
//   render: (
//     ctx: ExaminationContext,
//   ) =>
//     | JSX.Element
//     | Promise<JSX.Element>
//     | Promise<Response>
//     | Promise<JSX.Element | Response>,
// ) {
//   return OpenEncounterWorkflowPage<ExaminationContext>(async (ctx) => {
//     const rendered = await render(ctx)
//     if (rendered instanceof Response) {
//       return rendered
//     }

//     const tabs: TabProps[] = ctx.state.patient_examinations
//       .map((assessment) => {
//         const active = assessment.examination_identifier ===
//           ctx.state.current_examination?.examination_identifier
//         return {
//           tab: assessment.display_name,
//           href: assessment.href,
//           active,
//           leftIcon: <Progress {...assessment} active={active} />,
//         }
//       })

//     tabs.push({
//       tab: 'Add Examinations',
//       href: replaceParams(
//         '/app/patients/:patient_id/encounters/:patient_encounter_id/examinations/add',
//         ctx.params,
//       ),
//       active: ctx.url.pathname.endsWith('/add'),
//       leftIcon: <PlusCircleIcon className='w-5 h-5' />,
//     })

//     return (
//       <>
//         <Tabs tabs={tabs} />
//         {rendered}
//       </>
//     )
//   })
// }
