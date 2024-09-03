import { completeStep, ReviewContext, ReviewLayout } from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../types.ts'
import FormButtons from '../../../../../islands/form/buttons.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
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

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  ReviewContext['state']
> = {
  async POST(req, ctx: ReviewContext) {
    const _form_values = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsOrders,
    )
    const completing_step = completeStep(ctx)
    return completing_step
  },
}

// deno-lint-ignore require-await
export default async function OrdersPage(
  _req: Request,
  ctx: ReviewContext,
) {
  return (
    <ReviewLayout ctx={ctx}>
      TODO OrdersPage
      <FormButtons />
    </ReviewLayout>
  )
}
