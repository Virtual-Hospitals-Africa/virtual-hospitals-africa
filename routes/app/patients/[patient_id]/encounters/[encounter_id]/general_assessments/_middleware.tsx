import { JSX } from 'preact'
import * as examinations from '../../../../../../../db/models/examinations.ts'
import {
  completeStep,
  EncounterContext,
  EncounterPage,
} from '../_middleware.tsx'
import { RenderedPatientExamination } from '../../../../../../../types.ts'
import {
  TabProps,
  Tabs,
} from '../../../../../../../components/library/Tabs.tsx'
import { Progress } from '../../../../../../../components/library/icons/progress.tsx'
import redirect from '../../../../../../../util/redirect.ts'

type GeneralAssessmentsState = {
  patient_general_assessments: RenderedPatientExamination[]
  current_assessment: RenderedPatientExamination
  next_incomplete_assessment?: RenderedPatientExamination
}

export type GeneralAssessmentsContext = EncounterContext & {
  state: GeneralAssessmentsState
}

export async function handler(
  _req: Request,
  ctx: GeneralAssessmentsContext,
) {
  const patient_general_assessments = await examinations.forPatientEncounter(
    ctx.state.trx,
    {
      patient_id: ctx.state.encounter.patient_id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_step: 'general_assessments',
    },
  )

  const next_incomplete_assessment = patient_general_assessments.find((a) =>
    !a.completed
  )

  const { general_assessment_slug } = ctx.params

  const current_assessment = general_assessment_slug
    ? patient_general_assessments.find((a) =>
      a.slug === general_assessment_slug
    )
    : undefined

  Object.assign(
    ctx.state,
    {
      patient_general_assessments,
      current_assessment: current_assessment!,
      next_incomplete_assessment,
    } satisfies GeneralAssessmentsState,
  )

  return ctx.next()
}

export type GeneralAssessmentsPageChildProps = {
  ctx: EncounterContext
  previously_completed: boolean
}

export function completeAssessment(ctx: GeneralAssessmentsContext) {
  const next_incomplete_assessment = ctx.state.patient_general_assessments.find(
    (a) =>
      !a.completed &&
      a.examination_identifier !==
        ctx.state.current_assessment.examination_identifier,
  )
  if (!next_incomplete_assessment) {
    return completeStep(ctx)
  }
  return redirect(next_incomplete_assessment.href)
}

export function GeneralAssessmentsPage(
  render: (
    ctx: GeneralAssessmentsContext,
  ) =>
    | JSX.Element
    | Promise<JSX.Element>
    | Promise<Response>
    | Promise<JSX.Element | Response>,
) {
  return EncounterPage<GeneralAssessmentsContext>(async (ctx) => {
    const rendered = await render(ctx)
    if (rendered instanceof Response) {
      return rendered
    }

    const tabs: TabProps[] = ctx.state.patient_general_assessments
      .map((assessment) => {
        const active = assessment.examination_identifier ===
          ctx.state.current_assessment.examination_identifier
        return {
          tab: assessment.display_name,
          href: assessment.href,
          active,
          leftIcon: <Progress {...assessment} active={active} />,
        }
      })

    return (
      <>
        <Tabs tabs={tabs} />
        {rendered}
      </>
    )
  })
}
