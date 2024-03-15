import {
  completeStep,
  EncounterContext,
  EncounterLayout,
} from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../../types.ts'
import FormButtons from '../../../../../../islands/form/buttons.tsx'
import * as doctor_reviews from '../../../../../../db/models/doctor_reviews.ts'
import { ReferralForm } from '../../../../../../components/referral/Form.tsx'
import { parseRequestAsserts } from '../../../../../../util/parseForm.ts'
import { assertOr400 } from '../../../../../../util/assertOr.ts'
import isObjectLike from '../../../../../../util/isObjectLike.ts'

function assertIsReferral(body: unknown): asserts body is {
  facility_id?: number
  facility_name?: string
  doctor_id?: number
  doctor_name?: string
  requester_notes?: string
} {
  assertOr400(isObjectLike(body))
  assertOr400(
    body.facility_id || body.doctor_id,
    'Must provide either facility_id or doctor_id',
  )
  return
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  async POST(req, ctx: EncounterContext) {
    const completing_step = completeStep(ctx)
    const { trx, encounter, encounter_provider } = ctx.state
    const referral = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsReferral,
    )
    await doctor_reviews.makeRequest(trx, {
      requested_by: encounter_provider.patient_encounter_provider_id,
      patient_id: encounter.patient_id,
      encounter_id: encounter.encounter_id,
      facility_id: referral.facility_id || null,
      requesting_doctor_id: referral.doctor_id || null,
      requester_notes: referral.requester_notes,
    })

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
      <ReferralForm
        review_request={review_request}
      />
      <FormButtons />
    </EncounterLayout>
  )
}
