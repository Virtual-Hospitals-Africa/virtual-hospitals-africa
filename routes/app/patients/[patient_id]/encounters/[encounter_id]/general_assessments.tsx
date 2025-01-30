import { assert } from 'std/assert/assert.ts'
import {
  completeStep,
  EncounterContext,
  EncounterPage,
} from './_middleware.tsx'
import {
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../../types.ts'
import * as examinations from '../../../../../../db/models/examinations.ts'
import * as findings from '../../../../../../db/models/examination_findings.ts'
import { parseRequest } from '../../../../../../util/parseForm.ts'
import { TabProps, Tabs } from '../../../../../../components/library/Tabs.tsx'
import { PatientExaminationForm } from '../../../../../../components/examinations/Form.tsx'
import hrefFromCtx from '../../../../../../util/hrefFromCtx.ts'
import { z } from 'zod'
import {
  GENERAL_ASSESSMENTS,
} from '../../../../../../shared/general_assessments.ts'
import { promiseProps } from '../../../../../../util/promiseProps.ts'
import { Progress } from '../../../../../../components/library/icons/progress.tsx'
import { assertOrRedirect } from '../../../../../../util/assertOr.ts'
import { generated_uuid } from '../../../../../../util/validators.ts'
import redirect from '../../../../../../util/redirect.ts'

const ExaminationFindingsSchema = z.object({
  patient_examination_id: generated_uuid,
  findings: z.any()
    // .transform((fs) => Array.from(Object.values(fs)))
    .transform((fs) => {
      console.log('fs', fs)
      return Array.from(Object.values(fs))
    })
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

function examHref(
  ctx: EncounterContext,
  exam: string,
) {
  return hrefFromCtx(ctx, (url) => {
    url.searchParams.set('exam', exam)
  })
}

async function findPatientExaminations(ctx: EncounterContext) {
  const { trx, encounter } = ctx.state
  const exam = ctx.url.searchParams.get('exam')
  const general_href = examHref(ctx, 'general')
  assertOrRedirect(exam, general_href)

  const assessments = await examinations.forPatientEncounter(trx, {
    patient_id: encounter.patient_id,
    encounter_id: ctx.params.encounter_id,
    encounter_step: 'general_assessments',
  })
  console.log({
    assessments,
  })

  const active_assessment = assessments.find(
    (assessment) => assessment.query_slug === exam,
  )
  assertOrRedirect(
    active_assessment,
    general_href,
  )
  const active_assessment_index = assessments.indexOf(active_assessment)
  const next_incomplete_assessment = assessments.find(
    (assessment, index) =>
      index > active_assessment_index && !assessment.completed,
  )

  const next_step = next_incomplete_assessment?.display_name || 'examinations'

  return {
    assessments,
    active_assessment,
    next_step,
    next_incomplete_assessment,
    exam,
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
            examHref(
              ctx,
              next_incomplete_assessment.query_slug,
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
          examination_identifier: active_assessment.examination_identifier,
          findings: form_values.findings,
          patient_examination_id: form_values.patient_examination_id,
        })
      ),
    })

    return completing_step
  },
}

export async function HeadToToeAssessmentPage(
  ctx: EncounterContext,
) {
  const { assessments, active_assessment, next_step } =
    await findPatientExaminations(ctx)

  const tabs: TabProps[] = GENERAL_ASSESSMENTS.map(
    (head_to_exam) => {
      const active = active_assessment.examination_identifier ===
        head_to_exam.examination_identifier
      const matching_assessment = assessments.find(
        (assessment) =>
          assessment.examination_identifier ===
            head_to_exam.examination_identifier,
      )
      assert(
        matching_assessment,
        `No head to toe assessment for ${head_to_exam.examination_identifier}`,
      )
      return {
        tab: head_to_exam.query_slug,
        href: examHref(ctx, head_to_exam.query_slug),
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
          findings={ctx.state.findings}
        />
      </>
    ),
  }
}

export default EncounterPage(HeadToToeAssessmentPage)
