import { H as HealthWorkerHomePage, aN as assertOr403, r as redirect, u, a5 as todayISOInJohannesburg, dC as OrganizationConsumableForm, F as object, G as string, b4 as number } from "../server-entry.mjs";
import { i as inventory } from "./inventory-LxIPqcyI.mjs";
import { c as consumables } from "./consumables-BSXGCNYH.mjs";
import { r as roleByProfession } from "./roleByProfession-D3ZuwA92.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const AddConsumableSchema = object({
  quantity: number(),
  consumable_id: string(),
  procured_from_name: string(),
  procured_from_id: string().optional()
}).describe("Add consumable");
const handler$1 = postHandler(AddConsumableSchema, async (ctx, to_add) => {
  const admin_role = roleByProfession(ctx.state.organization_employment, "admin");
  assertOr403(admin_role);
  const {
    organization_id
  } = ctx.params;
  await inventory.procureConsumable(ctx.state.trx, organization_id, {
    created_by: admin_role.employment_id,
    procured_from_id: to_add.procured_from_id,
    procured_from_name: to_add.procured_from_name,
    consumable_id: to_add.consumable_id,
    quantity: to_add.quantity,
    //Todo: check the logic for non medicines consumables
    container_size: 1,
    number_of_containers: to_add.quantity
  });
  const success = encodeURIComponent(`Consumable added to your organization's inventory 🏥`);
  return redirect(`/app/organizations/${organization_id}/inventory?active_tab=consumables&success=${success}`);
});
const add_consumable = HealthWorkerHomePage("Add Consumable", async function ConsumableAdd({
  url,
  state
}) {
  const consumable_id = url.searchParams.get("consumable_id");
  const consumable = consumable_id ? await consumables.getById(state.trx, consumable_id) : null;
  return u(OrganizationConsumableForm, {
    today: todayISOInJohannesburg(),
    consumable
  });
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_inventory_add_consumable = add_consumable;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_inventory_add_consumable as default,
  handler,
  handlers
};
