import { a, u, av as Form, K as FormRow, B as Button, bo as SectionHeader, H as HealthWorkerHomePage, aN as assertOr403, r as redirect, a2 as promiseProps, a5 as todayISOInJohannesburg, z, a9 as string_or_number_as_string, cL as positive_integer } from "../server-entry.mjs";
import { i as inventory } from "./inventory-LxIPqcyI.mjs";
import { m as medications } from "./medications-Co2lw_jP.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { r as roleByProfession } from "./roleByProfession-D3ZuwA92.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_2 = ['<div class="flex flex-col w-full gap-2">', "</div>"];
const $$_tpl_1 = ["<div>", "<div>", "</div></div>"];
function InventoryMedicineForm({
  today: _today,
  medication: _medication,
  last_procurement: _last_procurement
}) {
  return a($$_tpl_1, u(SectionHeader, {
    className: "my-5 text-[20px]",
    children: "Add Medicine"
  }), u(Form, {
    method: "post",
    children: a($$_tpl_2, u(FormRow, {
      children: u(Button, {
        type: "submit",
        children: "Submit"
      })
    }))
  }));
}
const AddMedicineSchema = z.object({
  medication_id: z.string(),
  quantity: positive_integer,
  container_size: positive_integer,
  number_of_containers: positive_integer,
  procured_from_id: z.string().optional(),
  procured_from_name: z.string().optional(),
  expiry_date: z.string().date().optional(),
  batch_number: string_or_number_as_string.optional()
});
const handler$1 = postHandler(AddMedicineSchema, async (ctx, form_values) => {
  const {
    organization,
    organization_employment,
    trx
  } = ctx.state;
  const admin_role = roleByProfession(organization_employment, "admin");
  assertOr403(admin_role);
  await inventory.addOrganizationMedicine(trx, organization.id, {
    created_by: admin_role.employment_id,
    ...form_values
  });
  const success = encodeURIComponent(`Medicine added to your organization's inventory 🏥`);
  return redirect(`/app/organizations/${organization.id}/inventory?active_tab=medicines&success=${success}`);
});
const add_medicine = HealthWorkerHomePage("Add Medicine", async function MedicineAdd({
  url: {
    searchParams
  },
  state: {
    trx,
    organization
  }
}) {
  const medication_id = searchParams.get("medication_id");
  const {
    medication,
    last_procurement
  } = !medication_id ? {
    medication: null,
    last_procurement: null
  } : await promiseProps({
    last_procurement: inventory.getLatestProcurement(trx, {
      medication_id,
      organization_id: organization.id
    }),
    medication: medications.getById(trx, medication_id)
  });
  return u(InventoryMedicineForm, {
    today: todayISOInJohannesburg(),
    medication,
    last_procurement
  });
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_inventory_add_medicine = add_medicine;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_inventory_add_medicine as default,
  handler,
  handlers
};
