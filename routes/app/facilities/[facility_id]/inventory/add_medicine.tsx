import { FreshContext } from '$fresh/server.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
  RenderedInventoryHistory,
} from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import InventoryMedicineForm from '../../../../../components/inventory/MedicineForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import * as inventory from '../../../../../db/models/inventory.ts'
import { searchManufacturedMedications } from '../../../../../db/models/drugs.ts'
import { FacilityContext } from '../_middleware.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import isString from '../../../../../util/isString.ts'
import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
import { todayISOInHarare } from '../../../../../util/date.ts'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import { ManufacturedMedicationSearchResult } from '../../../../../types.ts'

export function assertIsUpsertMedicine(
  obj: unknown,
): asserts obj is {
  manufactured_medication_name: string
  manufactured_medication_id: number
  manufactured_medication: {
    strength: number
  }
  procured_from_name: string
  procured_from_id?: number
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
  FacilityContext['state']
> = {
  async POST(req, ctx) {
    const { admin } = ctx.state.facility_employment.roles
    assertOr403(admin)

    const facility_id = ctx.state.facility.id

    const to_add = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsUpsertMedicine,
    )

    await inventory.addFacilityMedicine(
      ctx.state.trx,
      facility_id,
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
      `Medicine added to your facility's inventory 🏥`,
    )

    return redirect(
      `/app/facilities/${facility_id}/inventory?active_tab=medicines&success=${success}`,
    )
  },
}

export default async function MedicineAdd(
  _req: Request,
  { route, url, state }: FacilityContext,
) {
  let manufactured_medication: ManufacturedMedicationSearchResult | null = null
  let last_procurement: RenderedInventoryHistory & { strength: number } | null =
    null
  const manufactured_medication_id = url.searchParams.get(
    'manufactured_medication_id',
  )
  if (manufactured_medication_id) {
    const manufactured_medications = await searchManufacturedMedications(
      state.trx,
      {
        ids: [parseInt(manufactured_medication_id)],
      },
    )
    assertOr404(manufactured_medications.length)
    manufactured_medication = manufactured_medications[0]

    const strength = url.searchParams.get(
      'strength',
    )

    if (strength) {
      last_procurement = await inventory.getLatestProcurement(
        state.trx,
        {
          facility_id: state.facility.id,
          manufactured_medication_id: parseInt(manufactured_medication_id),
          strength: parseFloat(strength),
        },
      )
    }
  }

  return (
    <Layout
      variant='home page'
      title='Add Medicine'
      route={route}
      url={url}
      health_worker={state.healthWorker}
    >
      <InventoryMedicineForm
        today={todayISOInHarare()}
        manufactured_medication={manufactured_medication}
        last_procurement={last_procurement
          ? {
            strength: last_procurement.strength!,
            quantity: last_procurement.change,
            container_size: last_procurement.container_size!,
            number_of_containers: last_procurement.number_of_containers!,
            procurer_id: last_procurement.procured_from_id!,
            procurer_name: last_procurement.procured_from!,
            batch_number: last_procurement.batch_number,
          }
          : null}
      />
    </Layout>
  )
}
