import { O as OpenEncounterWorkflowPage, a1 as completeAndProceedToNextStep, F as object, u } from "../server-entry.mjs";
import { p as patient_registration } from "./patient_registration-B5uIKBjP.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { P as PatientRegistrationSummary } from "./Summary-BF2H5f3f.mjs";
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
const PatientRegistrationConfirmDetailsSchema = object({});
const handler$1 = postHandler(PatientRegistrationConfirmDetailsSchema, (ctx) => {
  return completeAndProceedToNextStep(ctx);
});
async function PatientRegistrationConfirmPage(ctx) {
  const patient_registration_summary = await patient_registration.getSummaryById(ctx.state.trx, ctx.state.patient.id);
  return u(PatientRegistrationSummary, {
    organization_id: ctx.state.organization.id,
    patient: patient_registration_summary,
    this_visit: ctx.state.encounter
  });
}
const confirm_details = OpenEncounterWorkflowPage(PatientRegistrationConfirmPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_registration_confirm_details = confirm_details;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_registration_confirm_details as default,
  handler,
  handlers
};
