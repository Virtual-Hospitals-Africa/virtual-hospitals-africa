import * as patient_conditions from '../../../../../../../../../db/models/patient_conditions.ts'
import * as examinations from '../../../../../../../../../db/models/examinations.ts'
import { z } from 'zod'
import MajorSurgeriesForm from '../../../../../../../../../islands/major-surgeries/Form.tsx'
import { parseRequest } from '../../../../../../../../../util/parseForm.ts'
import {
  completeAssessment,
  HistoryContext,
  HistoryPage,
} from './_middleware.tsx'

export const MajorSurgeriesSchema = z.object({
  major_surgeries: z.array(
    z.object({
      id: z.string(),
      start_date: z.string(),
    }),
  ).default([]),
})

export const handler = {
  async POST(ctx: HistoryContext) {
    const req = ctx.req

    // TODO, parallelize
    const completing_assessment = await completeAssessment(ctx)
    const form_values = await parseRequest(
      ctx.state.trx,
      req,
      MajorSurgeriesSchema.parse,
    )

    const examination = await examinations.createCompletedIfNoneExists(
      ctx.state.trx,
      {
        patient_id: ctx.state.patient.id,
        patient_encounter_id: ctx.state.encounter.patient_encounter_id,
        patient_encounter_employee_id:
          ctx.state.encounter_employee_presence.patient_encounter_employee_id,
        examination_identifier:
          ctx.state.current_assessment.examination_identifier,
      },
    )

    await patient_conditions.upsertMajorSurgeries(
      ctx.state.trx,
      {
        patient_id: ctx.state.patient.id,
        patient_examination_id: examination.id,
        major_surgeries: form_values.major_surgeries,
      },
    )

    return completing_assessment
  },
}

export default HistoryPage(async function MajorSurgeriesPage(ctx) {
  const { trx, patient } = ctx.state
  const patient_id = patient.id

  const major_surgeries = await patient_conditions.getMajorSurgeries(trx, {
    patient_id,
  })

  return <MajorSurgeriesForm major_surgeries={major_surgeries} />
})
