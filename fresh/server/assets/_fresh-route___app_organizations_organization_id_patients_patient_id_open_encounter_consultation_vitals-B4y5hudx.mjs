import { be as assertOr405, r as redirect } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
async function vitals(ctx) {
  const req = ctx.req;
  assertOr405(req.method === "GET");
  const url = new URL(ctx.url);
  url.pathname += "/measurements";
  return redirect(url);
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_vitals = vitals;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_vitals as default,
  handler,
  handlers
};
