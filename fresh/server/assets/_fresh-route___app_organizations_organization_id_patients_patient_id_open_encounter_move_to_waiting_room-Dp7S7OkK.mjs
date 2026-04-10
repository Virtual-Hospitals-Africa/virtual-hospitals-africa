import { w as waiting_room, Y as success, j as replaceParams, ay as capitalize, b2 as preferredName, r as redirect, F as object } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const MoveToWaitingRoomSchema = object({});
const handler$1 = postHandler(MoveToWaitingRoomSchema, async (ctx) => {
  const {
    trx,
    organization,
    organization_employment,
    encounter
  } = ctx.state;
  await waiting_room.moveTo(trx, {
    organization,
    organization_employment,
    encounter
  });
  const next_url = success(`${capitalize(preferredName(encounter.patient, "patient"))} has been moved to the waiting room`, replaceParams(`/app/organizations/:organization_id/waiting_room`, ctx.params));
  return redirect(next_url);
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_move_to_waiting_room = void 0;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_move_to_waiting_room as default,
  handler,
  handlers
};
