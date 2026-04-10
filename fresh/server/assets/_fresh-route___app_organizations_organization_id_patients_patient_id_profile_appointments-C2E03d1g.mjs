import { cR as PatientProfilePage, cS as appointments$1, cT as uniqBy, cU as organizationOf, cV as google_tokens, m as assert, x as HealthWorkerGoogleClient, cW as parseDateTime, u } from "../server-entry.mjs";
import { A as Appointments } from "./Appointments-CMMRLfC-.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const appointments = PatientProfilePage("Appointments", async function AppointmentsPage(ctx) {
  const patient_appointments = await appointments$1.getForPatient(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
    time_range: "future"
  });
  const renderable_appointments = await Promise.all(patient_appointments.map(async (appt) => {
    const first_provider = appt.employees[0];
    const organizations = uniqBy(appt.employees.map(organizationOf), "id");
    const tokens = await google_tokens.getByEntityId(ctx.state.trx, "health_worker", first_provider.health_worker_id);
    assert(tokens);
    const organizations_with_addresses = organizations.filter((o) => o.formatted_address);
    assert(organizations_with_addresses.length <= 1, "Unsure how to handle an appointment booked with employees representing distinct organizations with physical addresses");
    assert(first_provider, `Could not find a provider for a patient appointment ${appt.id}`);
    const google_client = new HealthWorkerGoogleClient(ctx.state.trx, {
      id: first_provider.health_worker_id,
      ...tokens
    });
    const gcal_item = await google_client.getEvent(first_provider.calendars.gcal_appointments_calendar_id, appt.gcal_event_id);
    assert(gcal_item, `Could not find event ${appt.gcal_event_id} in google calendar for provider ${first_provider.employee_id}`);
    return {
      type: "patient_appointment",
      id: appt.id,
      patient: ctx.state.patient,
      duration_minutes: appt.duration_minutes,
      start: parseDateTime(appt.start),
      end: parseDateTime(appt.end),
      employees: appt.employees,
      physical_location: organizations_with_addresses.length ? {
        organization: organizations_with_addresses[0]
      } : void 0,
      virtual_location: gcal_item.hangoutLink ? {
        href: gcal_item.hangoutLink
      } : void 0
    };
  }));
  return u(Appointments, {
    headerText: "Upcoming patient appointments",
    patient_id: ctx.state.patient.id,
    appointments: renderable_appointments,
    url: ctx.url,
    className: "mt-4"
  });
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_profile_appointments = appointments;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_profile_appointments as default,
  handler,
  handlers
};
