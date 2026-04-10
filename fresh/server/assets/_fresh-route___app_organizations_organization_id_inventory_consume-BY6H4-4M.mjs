import { H as HealthWorkerHomePage, aN as assertOr403, r as redirect, dD as OrganizationConsumableForm, F as object, G as string, b4 as number } from "../server-entry.mjs";
import { i as inventory } from "./inventory-LxIPqcyI.mjs";
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
const ConsumeSchema = object({
  quantity: number(),
  procurement_id: string(),
  consumable_id: string()
}).describe("Consume consumable");
const handler$1 = postHandler(ConsumeSchema, async (ctx, to_add) => {
  const admin_role = roleByProfession(ctx.state.organization_employment, "admin");
  assertOr403(admin_role);
  const active_tab = ctx.url.searchParams.get("active_tab");
  const organization_id = ctx.state.organization.id;
  await inventory.consumeConsumable(ctx.state.trx, organization_id, {
    created_by: admin_role.employment_id,
    procurement_id: to_add.procurement_id,
    consumable_id: to_add.consumable_id,
    quantity: to_add.quantity
  });
  const success = encodeURIComponent(`Item consumed!`);
  return redirect(`/app/organizations/${organization_id}/inventory/history?consumable_id=${to_add.consumable_id}&active_tab=${active_tab}&success=${success}`);
});
const consume = HealthWorkerHomePage("Consumption Test", OrganizationConsumableForm);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_inventory_consume = consume;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_inventory_consume as default,
  handler,
  handlers
};
