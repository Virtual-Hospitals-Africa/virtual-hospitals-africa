import { z, k as patient_encounters, m as assert, o as otherEmployeePresentWithPatient, q as PresentWithAnotherPatientError, r as redirect } from "../server-entry.mjs";
import { p as patient_registration } from "./patient_registration-B5uIKBjP.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./patient_new-GAkLghDO.mjs";
import "./patient_new_encounters-aQfRoZZN.mjs";
const handler$1 = postHandler(z.object({}), async (ctx) => {
  const {
    trx,
    organization,
    present_encounter_id,
    organization_employment
  } = ctx.state;
  if (present_encounter_id) {
    const present_encounter = await patient_encounters.getById(trx, present_encounter_id);
    assert(patient_encounters.isOpen(present_encounter));
    const other_employee = await otherEmployeePresentWithPatient(trx, present_encounter, organization_employment);
    throw new PresentWithAnotherPatientError(present_encounter, other_employee);
  }
  const {
    success,
    patient_id
  } = await patient_registration.start(trx, organization, organization_employment);
  assert(success);
  return redirect(`/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/registration/personal`);
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_start_registration = void 0;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_start_registration as default,
  handler,
  handlers
};
