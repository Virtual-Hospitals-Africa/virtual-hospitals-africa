import {
  completeStep,
  EncounterContext,
  EncounterLayout,
} from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../../types.ts'
import FormButtons from '../../../../../../islands/form/buttons.tsx'
import * as doctor_reviews from '../../../../../../db/models/doctor_reviews.ts'
import SectionHeader from '../../../../../../components/library/typography/SectionHeader.tsx'
import { ReferralForm } from '../../../../../../islands/referral/Form.tsx'
import { parseRequestAsserts } from '../../../../../../util/parseForm.ts'
import { assertOr400 } from '../../../../../../util/assertOr.ts'
import isObjectLike from '../../../../../../util/isObjectLike.ts'

function assertIsReferral(body: unknown): asserts body is {
  review_request?: {
    id?: number
    organization_id?: string
    organization_name?: string
    doctor_id?: number
    doctor_name?: string
    requester_notes?: string
  }
} {
  assertOr400(isObjectLike(body))
  if (!body.review_request) return
  assertOr400(isObjectLike(body.review_request))
  assertOr400(
    body.review_request.organization_id || body.review_request.doctor_id,
    'Must provide either organization_id or doctor_id',
  )
  return
}

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
    const body = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsReferral,
    )

    if (body.review_request) {
      await doctor_reviews.upsertRequest(trx, {
        id: body.review_request.id || undefined,
        organization_id: body.review_request.organization_id || null,
        requesting_doctor_id: body.review_request.doctor_id || null,
        requester_notes: body.review_request.requester_notes,
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

export default async function ReferralPage(
  _req: Request,
  ctx: EncounterContext,
) {
  const review_request = await doctor_reviews.getRequest(ctx.state.trx, {
    requested_by: ctx.state.encounter_provider.patient_encounter_provider_id,
  })

  return (
    <EncounterLayout ctx={ctx}>
      <SectionHeader>Asynchronous Reviews</SectionHeader>
      <ReferralForm
        review_request={review_request}
      />
      <FormButtons />
    </EncounterLayout>
  )
}
