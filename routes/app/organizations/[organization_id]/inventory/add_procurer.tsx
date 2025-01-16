import {
  LoggedInHealthWorkerHandlerWithProps,
  Procurer,
} from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import * as inventory from '../../../../../db/models/inventory.ts'

import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
import { OrganizationContext } from '../_middleware.ts'
import ProcurerForm from '../../../../../islands/inventory/ProcurerForm.tsx'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { HealthWorkerHomePageLayout } from '../../../_middleware.tsx'

export function assertIsUpsertProcurer(obj: unknown): asserts obj {
  assertOr400(isObjectLike(obj))
  assertOr400(typeof obj.name === 'string')
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  Record<never, unknown>,
  OrganizationContext['state']
> = {
  async POST(req, ctx) {
    const { admin } = ctx.state.organization_employment.roles
    assertOr403(admin)

    const { organization_id } = ctx.params

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
      `/app/organizations/${organization_id}/inventory?active_tab=consumables&success=${success}`,
    )
  },
}

export default HealthWorkerHomePageLayout(
  'Add Procurer',
  ProcurerForm,
)
