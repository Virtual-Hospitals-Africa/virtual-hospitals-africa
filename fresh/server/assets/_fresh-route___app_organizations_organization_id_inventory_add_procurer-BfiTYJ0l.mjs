import { H as HealthWorkerHomePage, aN as assertOr403, r as redirect, dB as ProcurerForm, F as object, G as string } from "../server-entry.mjs";
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
const AddProcurerSchema = object({
  name: string()
}).describe("Add procurer");
const handler$1 = postHandler(AddProcurerSchema, async (ctx, to_upsert) => {
  const admin_role = roleByProfession(ctx.state.organization_employment, "admin");
  assertOr403(admin_role);
  const {
    organization_id
  } = ctx.params;
  await inventory.upsertProcurer(ctx.state.trx, to_upsert);
  const success = encodeURIComponent(`Procurer added successfully!`);
  return redirect(`/app/organizations/${organization_id}/inventory?active_tab=consumables&success=${success}`);
});
const add_procurer = HealthWorkerHomePage("Add Procurer", ProcurerForm);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_inventory_add_procurer = add_procurer;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_inventory_add_procurer as default,
  handler,
  handlers
};
