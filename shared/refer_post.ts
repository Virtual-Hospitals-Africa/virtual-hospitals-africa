import z from 'zod'
import type { RenderedReferralRecipient } from '../types.ts'

export type ReferPostBody = z.input<typeof ReferSchema>

// What the refer route hands back so the caller can render the referral's
// state without a round trip to the page.
export type ReferPostResponse = {
  referral_id: string
  recipients: RenderedReferralRecipient[]
}

export const ReferSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('colleague'),
    health_worker_ids_to_be_notified: z.string().uuid().array().min(1),
  }),
  z.object({
    type: z.literal('nearest_hospital'),
    organization_id: z.string().uuid(),
  }),
])
