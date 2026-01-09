import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'

import FormButtons from '../../../../../islands/form/buttons.tsx'
import { parseRequestAsserts } from '../../../../../backend/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'

type OrdersFormValues = {
  orders: unknown
}

function assertIsOrders(
  form_values: unknown,
): asserts form_values is OrdersFormValues {
  assertOr400(isObjectLike(form_values))
}

export const handler = {
  async POST(ctx: ReviewContext) {
    const req = ctx.req
    const _form_values = await parseRequestAsserts(
      req,
      assertIsOrders,
    )
    const completing_step = completeStep(ctx)
    return completing_step
  },
}

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
