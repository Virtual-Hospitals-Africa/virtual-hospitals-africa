import { z } from 'zod'
import {
  completeStep,
  EncounterContext,
  EncounterPage,
  EncounterPageChildProps,
} from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../../types.ts'
import * as doctor_reviews from '../../../../../../db/models/doctor_reviews.ts'
import SectionHeader from '../../../../../../components/library/typography/SectionHeader.tsx'
import { ReferralForm } from '../../../../../../islands/referral/Form.tsx'
import { parseRequest } from '../../../../../../util/parseForm.ts'

const ReviewRequestSchema = z.object({
  id: z.string().optional(),
  organization_id: z.string().optional(),
  organization_name: z.string().optional(),
  doctor_id: z.string().optional(),
  doctor_name: z.string().optional(),
  requester_notes: z.string().optional(),
}).refine(
  (data) => data.organization_id || data.doctor_id,
  {
    message: 'Must provide either organization_id or doctor_id',
    path: ['organization_id', 'doctor_id'],
  },
)

const PostSchema = z.object({
  review_request: ReviewRequestSchema.optional(),
})

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  async POST(req: Request, ctx: EncounterContext) {
    const completing_step = completeStep(ctx)
    const { trx, encounter, encounter_provider } = ctx.state
    const getting_original_request = doctor_reviews.getRequest(ctx.state.trx, {
      requested_by: ctx.state.encounter_provider.patient_encounter_provider_id,
    })
    const body = await parseRequest(
      ctx.state.trx,
      req,
      PostSchema.parse,
    )

    if (body.review_request) {
      await doctor_reviews.upsertRequest(trx, {
        ...body.review_request,
        requested_by: encounter_provider.patient_encounter_provider_id,
        patient_id: encounter.patient_id,
        encounter_id: encounter.encounter_id,
      })
    } else {
      const original_request = await getting_original_request
      if (original_request) {
        await doctor_reviews.deleteRequest(trx, original_request.id)
      }
    }

    return completing_step
  },
}

export async function ReferralPage(
  { ctx, encounter_provider }: EncounterPageChildProps,
) {
  const review_request = await doctor_reviews.getRequest(ctx.state.trx, {
    requested_by: encounter_provider.patient_encounter_provider_id,
  })

  return (
    <>
      <SectionHeader>Asynchronous Reviews</SectionHeader>
      <ReferralForm
        review_request={review_request}
      />
    </>
  )
}

export default EncounterPage(ReferralPage)
