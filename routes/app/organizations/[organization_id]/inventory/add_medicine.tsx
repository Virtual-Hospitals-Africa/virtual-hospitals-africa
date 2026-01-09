import redirect from '../../../../../util/redirect.ts'
import InventoryMedicineForm from '../../../../../components/inventory/MedicineForm.tsx'
import * as inventory from '../../../../../db/models/inventory.ts'
import manufactured_medications from '../../../../../db/models/manufactured_medications.ts'
import { OrganizationContext } from '../_middleware.ts'
import { assertOr403 } from '../../../../../util/assertOr.ts'
import { todayISOInJohannesburg } from '../../../../../util/date.ts'
import { promiseProps } from '../../../../../util/promiseProps.ts'
import { HealthWorkerHomePageLayout } from '../../../_middleware.tsx'
import { postHandler } from '../../../../../backend/postHandler.ts'
import z from 'zod'
import {
  positive_decimal,
  positive_integer,
  string_or_number_as_string,
} from '../../../../../util/validators.ts'
import roleByProfession from '../../../../../shared/roleByProfession.ts'

const AddMedicineSchema = z.object({
  manufactured_medication_id: z.string(),
  manufactured_medication: z.object({
    strength: positive_decimal.transform((d) => d.toFixed()),
  }),
  quantity: positive_integer,
  container_size: positive_integer,
  number_of_containers: positive_integer,
  procured_from_id: z.string().optional(),
  procured_from_name: z.string().optional(),
  expiry_date: z.string().date().optional(),
  batch_number: string_or_number_as_string.optional(),
})

export const handler = postHandler(
  AddMedicineSchema,
  async (
    ctx: OrganizationContext,
    { manufactured_medication, ...form_values },
  ): Promise<Response> => {
    const { organization, organization_employment, trx } = ctx.state
    const admin_role = roleByProfession(organization_employment, 'admin')
    assertOr403(admin_role)

    await inventory.addOrganizationMedicine(
      trx,
      organization.id,
      {
        created_by: admin_role.employment_id,
        ...form_values,
        strength: manufactured_medication.strength,
      },
    )

    const success = encodeURIComponent(
      `Medicine added to your organization's inventory 🏥`,
    )

    return redirect(
      `/app/organizations/${organization.id}/inventory?active_tab=medicines&success=${success}`,
    )
  },
)

export default HealthWorkerHomePageLayout(
  'Add Medicine',
  async function MedicineAdd(
    { url: { searchParams }, state: { trx, organization } }:
      OrganizationContext,
  ) {
    const strength = searchParams.has('strength')
      ? positive_decimal.parse(searchParams.get('strength')).toFixed()
      : null

    const manufactured_medication_id = searchParams.get(
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
      <InventoryMedicineForm
        today={todayISOInJohannesburg()}
        manufactured_medication={manufactured_medication}
        last_procurement={last_procurement}
      />
    )
  },
)
