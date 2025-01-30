import { JSX } from 'preact'
import * as examinations from '../../../../../../../db/models/examinations.ts'
import { EncounterContext, EncounterPage } from '../_middleware.tsx'
import { RenderedPatientExamination } from '../../../../../../../types.ts'
import redirect from '../../../../../../../util/redirect.ts'
import {
  TabProps,
  Tabs,
} from '../../../../../../../components/library/Tabs.tsx'
import { Progress } from '../../../../../../../components/library/icons/progress.tsx'

type HistoryState = {
  history_assessments: RenderedPatientExamination[]
  current_assessment: RenderedPatientExamination
  next_incomplete_assessment?: RenderedPatientExamination
}

export type HistoryContext = EncounterContext & {
  state: HistoryState
}

export async function handler(
  _req: Request,
  ctx: HistoryContext,
) {
  const history_assessments = await examinations.forPatientEncounter(
    ctx.state.trx,
    {
      patient_id: ctx.state.encounter.patient_id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_step: 'history',
    },
  )

  const next_incomplete_assessment = history_assessments.find((a) =>
    !a.completed
  )

  const current_assessment_slug = ctx.url.pathname.match(/\/history\/(.*)$/)
  const current_assessment = current_assessment_slug &&
    history_assessments.find((a) => a.query_slug === current_assessment_slug[1])

  Object.assign(
    ctx.state,
    {
      history_assessments,
      current_assessment: current_assessment!,
      next_incomplete_assessment,
    } satisfies HistoryState,
  )

  return ctx.next()
}

export type HistoryPageChildProps = {
  ctx: EncounterContext
  previously_completed: boolean
}

export function HistoryPage(
  render: (
    ctx: HistoryContext,
  ) =>
    | JSX.Element
    | Promise<JSX.Element>
    | Promise<Response>
    | Promise<JSX.Element | Response>,
) {
  return EncounterPage<HistoryContext>(async (ctx) => {
    const rendered = await render(ctx)
    if (rendered instanceof Response) {
      return rendered
    }

    const tabs: TabProps[] = ctx.state.history_assessments
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
