import { O as OpenEncounterWorkflowPage, a1 as completeAndProceedToNextStep, a } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ["<p>TODO</p>"];
const handler$1 = {
  // deno-lint-ignore require-await
  async POST(ctx) {
    const completing_step = completeAndProceedToNextStep(ctx);
    return completing_step;
  }
};
const orders = OpenEncounterWorkflowPage(function OrdersPage(_ctx) {
  return a($$_tpl_1);
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_orders = orders;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_orders as default,
  handler,
  handlers
};
