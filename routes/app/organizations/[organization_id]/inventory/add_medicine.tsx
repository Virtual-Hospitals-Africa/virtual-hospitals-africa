import redirect from '../../../../../util/redirect.ts'
import InventoryMedicineForm from '../../../../../components/inventory/MedicineForm.tsx'
import { inventory } from '../../../../../db/models/inventory.ts'
import { medications } from '../../../../../db/models/medications.ts'
import { OrganizationContext } from '../_middleware.ts'
import { assertOr403 } from '../../../../../util/assertOr.ts'
import { todayISOInJohannesburg } from '../../../../../util/date.ts'
import { promiseProps } from '../../../../../util/promiseProps.ts'
import { HealthWorkerHomePageLayout } from '../../../_middleware.tsx'
import { postHandler } from '../../../../../backend/postHandler.ts'
import z from 'zod'
import { positive_decimal, positive_integer, string_or_number_as_string } from '../../../../../util/validators.ts'
import roleByProfession from '../../../../../shared/roleByProfession.ts'

const AddMedicineSchema = z.object({
  medication_id: z.string(),
  medication: z.object({
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
    { medication, ...form_values },
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
        strength: medication.strength,
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
    { url: { searchParams }, state: { trx, organization } }: OrganizationContext,
  ) {
    const strength = searchParams.has('strength') ? positive_decimal.parse(searchParams.get('strength')).toFixed() : null

    const medication_id = searchParams.get(
      'medication_id',
    )

    const { medication, last_procurement } = !medication_id ? { medication: null, last_procurement: null } : await promiseProps({
      last_procurement: inventory.getLatestProcurement(
        trx,
        {
          medication_id,
          strength,
          organization_id: organization.id,
        },
      ),
      medication: medications.getById(
        trx,
        medication_id,
      ),
    })

    return (
      <InventoryMedicineForm
        today={todayISOInJohannesburg()}
        medication={medication}
        last_procurement={last_procurement}
      />
    )
  },
)
