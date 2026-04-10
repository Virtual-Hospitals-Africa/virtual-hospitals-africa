import { r as redirect, j as replaceParams } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
function handler$1(ctx) {
  return redirect(replaceParams("/app/organizations/:organization_id/patients/:patient_id/profile/patient_information/general", ctx.params));
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_profile_patient_information_index = void 0;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_profile_patient_information_index as default,
  handler,
  handlers
};
