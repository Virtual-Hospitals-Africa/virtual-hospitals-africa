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
import * as findings from '../../../../../../db/models/findings.ts'
import { parseRequest } from '../../../../../../util/parseForm.ts'
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
import { generated_uuid } from '../../../../../../util/validators.ts'
import redirect from '../../../../../../util/redirect.ts'

const ExaminationFindingsSchema = z.object({
  patient_examination_id: generated_uuid,
  findings: z.any()
    .transform((fs) => Array.from(Object.values(fs)))
    .pipe(z.array(
      z.object({
        patient_examination_finding_id: generated_uuid,
        snomed_concept_id: z.number(),
        snomed_english_term: z.string(),
        additional_notes: z.string().nullable().optional().transform((v) =>
          v || null
        ),
        body_sites: z.array(z.object({
          patient_examination_finding_body_site_id: generated_uuid,
          snomed_concept_id: z.number(),
          snomed_english_term: z.string(),
        })).optional(),
      }),
    )).optional().transform((fs) => fs || []),
})

function tabHref(
  ctx: EncounterContext,
  tab: HeadToToeAssessmentTab,
) {
  return hrefFromCtx(ctx, (url) => {
    url.searchParams.set('tab', tab)
  })
}

async function findPatientExaminations(ctx: EncounterContext) {
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
  const next_incomplete_assessment = assessments.find(
    (assessment, index) =>
      index > active_assessment_index && !assessment.completed,
  )

  const next_step = next_incomplete_assessment
    ? next_incomplete_assessment.tab
    : 'examinations'

  return {
    assessments,
    active_assessment,
    next_step,
    next_incomplete_assessment,
    tab,
  }
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  async POST(req, ctx: EncounterContext) {
    const { active_assessment, next_incomplete_assessment } =
      await findPatientExaminations(ctx)

    // TODO: only complete the step if all have been completed
    const { completing_step } = await promiseProps({
      completing_step: !next_incomplete_assessment
        ? completeStep(ctx)
        : Promise.resolve(
          redirect(
            tabHref(
              ctx,
              next_incomplete_assessment.tab as HeadToToeAssessmentTab,
            ),
          ),
        ),
      upserting_findings: parseRequest(
        ctx.state.trx,
        req,
        ExaminationFindingsSchema.parse,
      ).then((form_values) =>
        findings.upsertForPatientExamination(ctx.state.trx, {
          patient_id: ctx.state.patient.id,
          encounter_id: ctx.state.encounter.encounter_id,
          encounter_provider_id:
            ctx.state.encounter_provider.patient_encounter_provider_id,
          examination_name: active_assessment.examination_name,
          findings: form_values.findings,
          patient_examination_id: form_values.patient_examination_id,
        })
      ),
    })

    return completing_step
  },
}

export async function HeadToToeAssessmentPage(
  { ctx }: EncounterPageChildProps,
) {
  const { assessments, active_assessment, next_step, tab } =
    await findPatientExaminations(ctx)
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
