import {
  completeAssessment,
  GeneralAssessmentsContext,
  GeneralAssessmentsPage,
} from './_middleware.tsx'
import {
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../../../types.ts'
import * as findings from '../../../../../../../db/models/examination_findings.ts'
import { parseRequest } from '../../../../../../../util/parseForm.ts'
import { PatientExaminationForm } from '../../../../../../../components/examinations/Form.tsx'
import { z } from 'zod'
import { promiseProps } from '../../../../../../../util/promiseProps.ts'
import {
  generated_uuid,
  snomed_concept_id,
} from '../../../../../../../util/validators.ts'

const ExaminationFindingsSchema = z.object({
  patient_examination_id: generated_uuid,
  findings: z.any()
    .transform((findings) => Array.from(Object.values(findings)))
    .pipe(z.array(
      z.object({
        patient_examination_finding_id: generated_uuid,
        snomed_concept_id,
        snomed_english_term: z.string(),
        additional_notes: z.string().nullable().optional().transform((v) =>
          v || null
        ),
        body_sites: z.array(z.object({
          patient_examination_finding_body_site_id: generated_uuid,
          snomed_concept_id,
          snomed_english_term: z.string(),
        })).optional(),
      }),
    )).optional().transform((fs) => fs || []),
})

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  GeneralAssessmentsContext['state']
> = {
  async POST(req, ctx: GeneralAssessmentsContext) {
    // TODO: only complete the step if all have been completed
    const { completing_assessment } = await promiseProps({
      completing_assessment: completeAssessment(ctx),
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
          examination_identifier:
            ctx.state.current_assessment.examination_identifier,
          findings: form_values.findings,
          patient_examination_id: form_values.patient_examination_id,
        })
      ),
    })

    return completing_assessment
  },
}

export default GeneralAssessmentsPage((ctx) => (
  <PatientExaminationForm
    patient_examination={ctx.state.current_assessment}
    findings={ctx.state.findings}
  />
))
