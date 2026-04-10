import { O as OpenEncounterWorkflowPage, bg as assertAllPriorStepsCompleted, Y as success, j as replaceParams, ay as capitalize, b2 as preferredName, r as redirect, F as object, G as string, u, cP as ProvidersSelect } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { e as employees_presence } from "./employees_presence-3gMzve44.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./organizations-DBMxrctL.mjs";
import "./addresses-DYgdsFAd.mjs";
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const EmergencyEscalationNotifyStaffSchema = object({
  employee_ids: string().uuid().array()
}).strict();
const handler$1 = postHandler(EmergencyEscalationNotifyStaffSchema, async (ctx, form_values) => {
  const {
    encounter
  } = ctx.state;
  console.log(form_values);
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: true
  });
  await delay(0);
  const next_room_name = "the resuscitation area";
  const next_url = success(`Please escort ${capitalize(preferredName(encounter.patient, "patient"))} to ${next_room_name}`, replaceParams(`/app/organizations/:organization_id/waiting_room`, ctx.params));
  return redirect(next_url);
});
async function EmergencyEscalationNotifyStaffPage(ctx) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false
  });
  const {
    trx,
    organization_id,
    health_worker_id
  } = ctx.state;
  const clinic_employees = await employees_presence.findAll(trx, {
    organization_id,
    excluding_health_worker_id: health_worker_id
  });
  return u(ProvidersSelect, {
    providers: clinic_employees
  });
}
const notify_staff = OpenEncounterWorkflowPage(EmergencyEscalationNotifyStaffPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_emergency_escalation_notify_staff = notify_staff;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_emergency_escalation_notify_staff as default,
  handler,
  handlers
};
