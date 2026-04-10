import { o as otherEmployeePresentWithPatient, v as assertOr400, Y as success, j as replaceParams, aw as employeeDisplay, r as redirect, F as object } from "../server-entry.mjs";
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
const handler$1 = postHandler(MoveToWaitingRoomSchema, async ({
  params,
  state
}) => {
  const {
    trx,
    encounter,
    organization_employment
  } = state;
  const other_employee = await otherEmployeePresentWithPatient(trx, encounter, organization_employment);
  assertOr400(other_employee, "Leaving patients is only allowed when another health worker is tending to them");
  await trx.updateTable("employment_presence").set({
    with_patient_id: null,
    at_work: true
  }).where("id", "=", organization_employment.employment_id).execute();
  const next_url = success(`${encounter.patient.name} was left with ${employeeDisplay(other_employee).display_name}`, replaceParams(`/app/organizations/:organization_id/waiting_room`, params));
  return redirect(next_url);
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_leave_with_another = void 0;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_leave_with_another as default,
  handler,
  handlers
};
