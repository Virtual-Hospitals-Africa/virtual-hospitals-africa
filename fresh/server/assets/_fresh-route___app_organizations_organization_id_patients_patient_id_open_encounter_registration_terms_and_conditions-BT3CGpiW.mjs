import { O as OpenEncounterWorkflowPage, a1 as completeAndProceedToNextStep, F as object, a } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ["TODO"];
const PatientRegistrationTermsAndConditionsSchema = object({});
const handler$1 = postHandler(PatientRegistrationTermsAndConditionsSchema, (ctx, _form_values) => {
  return completeAndProceedToNextStep(ctx);
});
async function PatientRegistrationTermsAndConditionsPage(_ctx) {
  return a($$_tpl_1);
}
const terms_and_conditions = OpenEncounterWorkflowPage(PatientRegistrationTermsAndConditionsPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_registration_terms_and_conditions = terms_and_conditions;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_registration_terms_and_conditions as default,
  handler,
  handlers
};
