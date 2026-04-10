import { k as patient_encounters, m as assert, w as waiting_room, r as redirect, z } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { p as patient_new } from "./patient_new-GAkLghDO.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./patient_new_encounters-aQfRoZZN.mjs";
const handler$1 = postHandler(z.object({}), async (ctx) => {
  const {
    trx,
    organization,
    organization_employment,
    present_encounter_id
  } = ctx.state;
  if (present_encounter_id) {
    const present_encounter = await patient_encounters.getById(trx, present_encounter_id);
    assert(patient_encounters.isOpen(present_encounter));
    await waiting_room.moveTo(trx, {
      organization,
      organization_employment,
      encounter: present_encounter
    });
  }
  const {
    success,
    patient_id
  } = await patient_new.create(trx, {
    organization,
    organization_employment,
    current_workflow: "emergency_escalation",
    next_workflows: ["stabilization"]
  });
  assert(success);
  return redirect(`/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/emergency_escalation/identify_patient`);
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_start_emergency_escalation = void 0;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_start_emergency_escalation as default,
  handler,
  handlers
};
