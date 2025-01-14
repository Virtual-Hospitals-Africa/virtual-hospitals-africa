import { z } from 'zod'
import {
  completeStep,
  EncounterContext,
  EncounterPage,
} from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../../types.ts'
import * as doctor_reviews from '../../../../../../db/models/doctor_reviews.ts'
import * as events from '../../../../../../db/models/events.ts'
import SectionHeader from '../../../../../../components/library/typography/SectionHeader.tsx'
import { ReferralForm } from '../../../../../../islands/referral/Form.tsx'
import { parseRequest } from '../../../../../../util/parseForm.ts'
import { promiseProps } from '../../../../../../util/promiseProps.ts'

const ReviewRequestSchema = z.object({
  organization_id: z.string().uuid().optional(),
  doctor_id: z.string().uuid().optional(),
  requester_notes: z.string().optional(),
}).refine(
  (data) => (console.log(data), data.organization_id || data.doctor_id),
  {
    message: 'Must request a review from a doctor or an organization',
    path: ['organization_id'],
  },
)
  .refine(
    (data) => !!data.organization_id === !data.doctor_id,
    {
      message:
        'Must request a review from a doctor or an organization, but not both',
      path: ['organization_id'],
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
    const { trx, encounter, encounter_provider } = ctx.state
    const { completing_step } = await promiseProps({
      completing_step: completeStep(ctx),
      inserting_request: parseRequest(
        ctx.state.trx,
        req,
        PostSchema.parse,
      ).then(async (body) => {
        if (!body.review_request) return
        const review_request = await doctor_reviews.upsertRequest(trx, {
          ...body.review_request,
          requested_by: encounter_provider.patient_encounter_provider_id,
          patient_id: encounter.patient_id,
          encounter_id: encounter.encounter_id,
        })

        await events.insert(trx, {
          type: 'ReviewRequested',
          data: {
            review_request_id: review_request.id,
          },
        })
      }),
    })

    return completing_step
  },
}

export function ReferralPage() {
  return (
    <>
      <SectionHeader>Asynchronous Reviews</SectionHeader>
      <ReferralForm />
    </>
  )
}

export default EncounterPage(ReferralPage)
