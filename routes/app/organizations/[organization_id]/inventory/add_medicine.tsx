import Layout from '../../../../../components/library/Layout.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import InventoryMedicineForm from '../../../../../components/inventory/MedicineForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import * as inventory from '../../../../../db/models/inventory.ts'
import manufactured_medications from '../../../../../db/models/manufactured_medications.ts'
import { OrganizationContext } from '../_middleware.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import isString from '../../../../../util/isString.ts'
import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
import { todayISOInHarare } from '../../../../../util/date.ts'
import { promiseProps } from '../../../../../util/promiseProps.ts'

export function assertIsUpsertMedicine(
  obj: unknown,
): asserts obj is {
  manufactured_medication_name: string
  manufactured_medication_id: string
  manufactured_medication: {
    strength: number
  }
  procured_from_name: string
  procured_from_id?: string
  quantity: number
  number_of_containers: number
  container_size: number
  expiry_date?: string
  batch_number?: string
} {
  assertOr400(isObjectLike(obj))
  assertOr400(isString(obj.manufactured_medication_name))
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  Record<never, unknown>,
  OrganizationContext['state']
> = {
  async POST(req, ctx) {
    const { admin } = ctx.state.organization_employment.roles
    assertOr403(admin)

    const organization_id = ctx.state.organization.id

    const to_add = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsUpsertMedicine,
    )

    await inventory.addOrganizationMedicine(
      ctx.state.trx,
      organization_id,
      {
        created_by: admin.employment_id,
        procured_from_id: to_add.procured_from_id,
        procured_from_name: to_add.procured_from_name,
        manufactured_medication_id: to_add.manufactured_medication_id,
        quantity: to_add.quantity,
        strength: to_add.manufactured_medication.strength,
        expiry_date: to_add.expiry_date,
        batch_number: to_add.batch_number,
        container_size: to_add.container_size,
        number_of_containers: to_add.number_of_containers,
      },
    )

    const success = encodeURIComponent(
      `Medicine added to your organization's inventory 🏥`,
    )

    return redirect(
      `/app/organizations/${organization_id}/inventory?active_tab=medicines&success=${success}`,
    )
  },
}

export default async function MedicineAdd(
  _req: Request,
  { route, url, state: { trx, organization, healthWorker } }:
    OrganizationContext,
) {
  const strength = parseInt(url.searchParams.get('strength')!) || undefined

  const manufactured_medication_id = url.searchParams.get(
    'manufactured_medication_id',
  )

  const { manufactured_medication, last_procurement } =
    !manufactured_medication_id
      ? { manufactured_medication: null, last_procurement: null }
      : await promiseProps({
        last_procurement: inventory.getLatestProcurement(
          trx,
          {
            manufactured_medication_id,
            strength,
            organization_id: organization.id,
          },
        ),
        manufactured_medication: manufactured_medications.getById(
          trx,
          manufactured_medication_id,
        ),
      })

  return (
    <Layout
      variant='health worker home page'
      title='Add Medicine'
      route={route}
      url={url}
      health_worker={healthWorker}
    >
      <InventoryMedicineForm
        today={todayISOInHarare()}
        manufactured_medication={manufactured_medication}
        last_procurement={last_procurement}
      />
    </Layout>
  )
}
