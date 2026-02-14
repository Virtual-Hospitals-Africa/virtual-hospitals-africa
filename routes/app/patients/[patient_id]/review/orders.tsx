import { z } from 'zod'
import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'
import FormButtons from '../../../../../islands/form/buttons.tsx'
import { postHandler } from '../../../../../backend/postHandler.ts'

const OrdersSchema = z.object({
  orders: z.unknown().optional(),
}).describe('Orders')

export const handler = postHandler(
  OrdersSchema,
  async (ctx: ReviewContext, _form_values) => {
    return await completeStep(ctx)
  },
)

// deno-lint-ignore require-await
export default async function OrdersPage(
  ctx: ReviewContext,
) {
  return (
    <ReviewLayout ctx={ctx}>
      TODO OrdersPage
      <FormButtons />
    </ReviewLayout>
  )
}
