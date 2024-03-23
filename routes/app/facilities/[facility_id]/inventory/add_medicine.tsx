// deno-lint-ignore-file no-explicit-any
import { FreshContext } from '$fresh/server.ts'
import { Container } from '../../../../../components/library/Container.tsx'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  FacilityConsumable,
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import InventoryMedicineForm from '../../../../../islands/inventory/MedicineForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import * as inventory from '../../../../../db/models/inventory.ts'
import * as drugs from '../../../../../db/models/drugs.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
import { FacilityContext } from '../_middleware.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import omit from '../../../../../util/omit.ts'

export function assertIsUpsertMedicine(
  obj: unknown,
) {
  assertOr400(isObjectLike(obj))
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
    ) as any

    await inventory.addFacilityConsumable(
      ctx.state.trx,
      {
        ...omit(to_add, [
          'procured_by_id',
          'procured_by_name',
          'consumable_name',
          'medication',
          'medication_name',
          'medication_id',
        ]),
        created_by: admin.employment_id,
        facility_id: facility_id,
        procured_by: to_add.procured_by_id,
        consumable_id: to_add.medication!.consumable_id,
        specifics: JSON.stringify({
          strength: to_add.medication!.strength!,
          form: to_add.medication!.form!
        }),
      } as any,
    )

    const success = encodeURIComponent(
      `Medicine added to your facility's inventory 🏥`,
    )

    return redirect(
      `/app/facilities/${facility_id}/inventory?active_tab=medicines&success=${success}`,
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
