import { assert } from 'std/assert/assert.ts'
import {
  completeStep,
  EncounterContext,
  EncounterPage,
  EncounterPageChildProps,
} from './_middleware.tsx'
import {
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../../types.ts'
import * as head_to_toe_assessments from '../../../../../../db/models/head_to_toe_assessments.ts'
import { parseRequest } from '../../../../../../util/parseForm.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import { TabProps, Tabs } from '../../../../../../components/library/Tabs.tsx'
import { PatientExaminationForm } from '../../../../../../components/examinations/Form.tsx'
import hrefFromCtx from '../../../../../../util/hrefFromCtx.ts'
import { z } from 'zod'
import {
  HEAD_TO_TOE_ASSESSMENT_TABS,
  type HeadToToeAssessmentTab,
  isHeadToToeAssessmentTab,
} from '../../../../../../shared/examinations.ts'
import { promiseProps } from '../../../../../../util/promiseProps.ts'
import { Progress } from '../../../../../../components/library/icons/progress.tsx'
import { assertOrRedirect } from '../../../../../../util/assertOr.ts'

const ExaminationFindingsSchema = z.object({})

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  async POST(req, ctx: EncounterContext) {
    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
    const { completing_step } = await promiseProps({
      completing_step: completeStep(ctx),
      upserting_findings: parseRequest(
        ctx.state.trx,
        req,
        ExaminationFindingsSchema.parse,
      ).then((findings) => {
        console.log('TODO handle findings', patient_id, findings)
      }),
    })

    return completing_step
  },
}

function tabHref(
  ctx: EncounterContext,
  tab: HeadToToeAssessmentTab,
) {
  return hrefFromCtx(ctx, (url) => {
    url.searchParams.set('tab', tab)
  })
}

export async function HeadToToeAssessmentPage(
  { ctx }: EncounterPageChildProps,
) {
  const { trx, encounter } = ctx.state
  const tab = ctx.url.searchParams.get('tab')
  assertOrRedirect(tab, tabHref(ctx, 'General'))

  assert(
    isHeadToToeAssessmentTab(tab),
    `Expected ${tab} to be a Head-to-toe assessment tab`,
  )

  const assessments = await head_to_toe_assessments.forPatientEncounter(trx, {
    patient_id: encounter.patient_id,
    encounter_id: ctx.params.encounter_id,
  })

  const active_assessment = assessments.find(
    (assessment) => assessment.tab === tab,
  )
  assert(
    active_assessment,
    `No head to toe assessment for ${tab}`,
  )
  const active_assessment_index = assessments.indexOf(active_assessment)
  const next_assessment = assessments[active_assessment_index + 1]
  const next_step = next_assessment ? next_assessment.tab : 'examinations'

  const tabs: TabProps[] = HEAD_TO_TOE_ASSESSMENT_TABS.map(
    (head_to_tab) => {
      const active = tab === head_to_tab.tab
      const matching_assessment = assessments.find(
        (assessment) =>
          assessment.examination_name === head_to_tab.examination_name,
      )
      assert(
        matching_assessment,
        `No head to toe assessment for ${head_to_tab.examination_name}`,
      )
      return {
        tab: head_to_tab.tab,
        href: tabHref(ctx, head_to_tab.tab),
        active,
        leftIcon: <Progress {...matching_assessment} active={active} />,
      }
    },
  )

  return {
    next_step_text: `Continue to ${next_step}`,
    children: (
      <>
        <Tabs tabs={tabs} />
        <PatientExaminationForm
          patient_examination={active_assessment}
        />
      </>
    ),
  }
}

export default EncounterPage(HeadToToeAssessmentPage)
