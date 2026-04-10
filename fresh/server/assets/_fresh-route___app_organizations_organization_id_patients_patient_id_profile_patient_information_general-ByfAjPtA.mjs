import { cR as PatientProfilePage, a } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ["<h1>Hello Patient general</h1>"];
const general = PatientProfilePage("Patient Information > General", function VisitsPage(_ctx) {
  return a($$_tpl_1);
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_profile_patient_information_general = general;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_profile_patient_information_general as default,
  handler,
  handlers
};
