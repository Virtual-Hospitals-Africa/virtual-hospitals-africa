import { x as HealthWorkerGoogleClient, aw as employeeDisplay, cQ as selfUrl, r as redirect, F as object } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { s as startWorkflow } from "./start-workflow-qhduKPTt.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./patient_presence-BDsaizBc.mjs";
const CreateGoogleMeetSchema = object({});
const handler$1 = postHandler(CreateGoogleMeetSchema, async (ctx) => {
  const {
    encounter,
    employee,
    patient_id
  } = ctx.state;
  const google_client = await HealthWorkerGoogleClient.fromHealthWorkerContext(ctx);
  const consultation_text = encounter.priority?.name ? `${encounter.priority?.name} unscheduled consultation` : "Unscheduled consultation";
  const {
    display_name
  } = employeeDisplay(employee);
  const patient_link = selfUrl() + `/app/patients/${patient_id}`;
  const next_url = await startWorkflow(ctx, "create_google_meet", {
    planning: "create_anew_every_time",
    patient_presence: "leave_in_current_workflow"
  });
  const google_meet = await google_client.createGoogleMeet({
    summary: `${consultation_text} with ${display_name}`,
    description: `Concerning patient ${patient_link}`
  });
  return redirect(next_url, google_meet);
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_start_google_meet = void 0;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_start_google_meet as default,
  handler,
  handlers
};
