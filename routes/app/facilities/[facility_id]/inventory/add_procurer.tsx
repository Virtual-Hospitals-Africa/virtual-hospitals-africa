import { FreshContext } from '$fresh/server.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
  Procurer,
} from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import * as inventory from '../../../../../db/models/inventory.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
import { FacilityContext } from '../_middleware.ts'
import ProcurerForm from '../../../../../islands/inventory/ProcurerForm.tsx'
import isObjectLike from '../../../../../util/isObjectLike.ts'

export function assertIsUpsertProcurer(obj: unknown): asserts obj {
  assertOr400(isObjectLike(obj))
  assertOr400(typeof obj.name === 'string')
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  Record<never, unknown>,
  FacilityContext['state']
> = {
  async POST(req, ctx) {
    const { admin } = ctx.state.facility_employment.roles
    assertOr403(admin)

    const facility_id = getRequiredNumericParam(ctx, 'facility_id')

    const to_upsert = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsUpsertProcurer,
    )

    await inventory.upsertProcurer(ctx.state.trx, to_upsert as Procurer)

    const success = encodeURIComponent(
      `Procurer added successfully!`,
    )

    return redirect(
      `/app/facilities/${facility_id}/inventory?active_tab=consumables&success=${success}`,
    )
  },
}

// deno-lint-ignore require-await
export default async function ProcurerPage(
  _req: Request,
  { route, url, state }: FreshContext<LoggedInHealthWorker>,
) {
  return (
    <Layout
      variant='home page'
      title='Add Procurer'
      route={route}
      url={url}
      health_worker={state.healthWorker}
    >
      <ProcurerForm />
    </Layout>
  )
}
