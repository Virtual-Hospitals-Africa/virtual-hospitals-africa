import { O as OpenEncounterWorkflowPage, v as assertOr400, x as HealthWorkerGoogleClient, y as completeLastStep, r as redirect, E as alert, F as object, G as string, u, I as InviteParticipantsList } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { e as employees_presence } from "./employees_presence-3gMzve44.mjs";
import { p as pluralize } from "./pluralize-HYG0Q538.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./organizations-DBMxrctL.mjs";
import "./addresses-DYgdsFAd.mjs";
const InviteParticipantsSchema = object({
  participant_emails: string().array()
});
const handler$1 = postHandler(InviteParticipantsSchema, async (ctx, form_values) => {
  const url = new URL(ctx.req.url);
  const hangout_link = url.searchParams.get("hangout_link");
  const html_link = url.searchParams.get("html_link");
  const event_id = url.searchParams.get("event_id");
  assertOr400(hangout_link, "hangout_link is required");
  assertOr400(html_link, "html_link is required");
  assertOr400(event_id, "event_id is required");
  const google_client = await HealthWorkerGoogleClient.fromHealthWorkerContext(ctx);
  const existing_event = await google_client.getEvent("primary", event_id);
  await google_client.updateEvent({
    calendarId: "primary",
    eventId: event_id,
    details: {
      ...existing_event,
      attendees: [...existing_event.attendees || [], ...form_values.participant_emails.map((email) => ({
        email
      }))]
    },
    sendUpdates: "all"
  });
  await completeLastStep(ctx);
  return redirect(alert({
    level: "success",
    message: `Invited ${pluralize("participant", form_values.participant_emails.length)} to the consultation`,
    actions: [{
      text: "Join the call",
      href: hangout_link,
      target: "_blank"
    }]
  }, ctx.state.open_encounter_pathname));
});
async function CreateGoogleMeetInviteParticipantsPage(ctx) {
  const url = new URL(ctx.req.url);
  const hangout_link = url.searchParams.get("hangout_link");
  const html_link = url.searchParams.get("html_link");
  const event_id = url.searchParams.get("event_id");
  assertOr400(hangout_link, "hangout_link is required");
  assertOr400(html_link, "html_link is required");
  assertOr400(event_id, "event_id is required");
  const {
    facility_employees,
    hospital_employees
  } = await employees_presence.getForClinicAssumingTestHospital(ctx.state.trx, ctx.state);
  return u(InviteParticipantsList, {
    facility_employees,
    hospital_employees
  });
}
const invite_participants = OpenEncounterWorkflowPage(CreateGoogleMeetInviteParticipantsPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_create_google_meet_invite_participants = invite_participants;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_create_google_meet_invite_participants as default,
  handler,
  handlers
};
