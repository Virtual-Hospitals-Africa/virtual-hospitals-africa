import * as patient_occupation from '../../../../../db/models/patient_occupations.ts'
import Occupation0_18 from '../../../../../islands/Occupation0-18.tsx'
import Occupation19 from '../../../../../islands/Occupation19.tsx'
import { assertAgeYearsKnown, IntakePage, postHandler } from './_middleware.tsx'
import { z } from 'zod'

export const OccupationSchema = z.object({
  occupation: z.object({
    school: z.object({
      status: z.string(),
      education_level: z.string().optional(),
      reason: z.string().optional(),
      desire_to_return: z.boolean().optional(),
      past: z.object({
        stopped_last_grade: z.string(),
        stopped_reason: z.string(),
      }).optional(),
      current: z.object({
        grade: z.string(),
        grades_dropping_reason: z.string().optional(),
        happy: z.boolean().optional(),
        inappropriate_reason: z.string().optional(),
      }).optional(),
    }),
    job: z.object({
      happy: z.boolean().optional(),
      descendants_employed: z.boolean().optional(),
      require_assistance: z.boolean().optional(),
      profession: z.string().optional(),
      work_satisfaction: z.string().optional(),
    }).optional(),
  }),
})

export const handler = postHandler(
  OccupationSchema.parse,
  async function updateOccupation(
    ctx,
    patient_id,
    form_values,
  ) {
    await patient_occupation.upsert(ctx.state.trx, {
      patient_id,
      ...form_values,
    })
  },
)

export default IntakePage(async function OccupationPage({ ctx, patient }) {
  const age_years = assertAgeYearsKnown(ctx)
  const OccupationForm = age_years <= 18 ? Occupation0_18 : Occupation19
  const occupation = await patient_occupation.get(ctx.state.trx, {
    patient_id: patient.id,
  })

  return <OccupationForm occupation={occupation} />
})
