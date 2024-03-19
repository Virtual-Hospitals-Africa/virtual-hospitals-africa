import { FreshContext } from '$fresh/server.ts'
import { Container } from '../../../../../components/library/Container.tsx'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import InventoryMedicineForm from '../../../../../islands/inventory/MedicineForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import * as inventory from '../../../../../db/models/inventory.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
import { FacilityContext } from '../_middleware.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'

export function assertIsUpsertMedicine(
  obj: unknown,
): asserts obj is { medicine_id: number; serial_number?: string } {
  assertOr400(isObjectLike(obj))
  assertOr400(typeof obj.Medicine_id === 'number')
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  Record<never, unknown>,
  FacilityContext['state']
> = {
  async POST(req, ctx) {
    const { admin } = ctx.state.facility_employment.roles
    assertOr403(admin)

    const facility_id = getRequiredNumericParam(ctx, 'facility_id')

    const to_add = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsUpsertMedicine,
    )
    const success = encodeURIComponent(
      `Medicine added to your facility's inventory 🏥`,
    )

    return redirect(
      `/app/facilities/${facility_id}/inventory?success=${success}`,
    )
  },
}

// deno-lint-ignore require-await
export default async function MedicineAdd(
  _req: Request,
  { route, url, state }: FreshContext<LoggedInHealthWorker>,
) {
  return (
    <Layout
      variant='home page'
      title='Add Medicine'
      route={route}
      url={url}
      health_worker={state.healthWorker}
    >
      <Container size='md'>
        <InventoryMedicineForm />
      </Container>
    </Layout>
  )
}
