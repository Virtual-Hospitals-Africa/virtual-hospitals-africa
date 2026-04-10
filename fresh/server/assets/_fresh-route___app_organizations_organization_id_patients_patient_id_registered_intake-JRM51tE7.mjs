import { g as getRequiredUUIDParam, a2 as promiseProps, k as patient_encounters, cS as appointments, p as patients, a, ad as generateUUID, m as assert, aS as WORKFLOW_STEPS, r as redirect, j as replaceParams, z } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ["<div>TODO</div>"];
const InsertForRegisteredPatientSchema = z.object({
  reason: z.enum(["checkup", "follow up", "maternity", "referral", "seeking treatment"]),
  notes: z.string().optional(),
  appointment_id: z.string().uuid().nullable().optional()
});
const handler$1 = postHandler(InsertForRegisteredPatientSchema, async (ctx, form_values) => {
  const patient_id = getRequiredUUIDParam(ctx, "patient_id");
  const {
    current_workflow
  } = await patient_encounters.insertSeekingTreatmentForRegisteredPatient(ctx.state.trx, ctx.state.organization, ctx.state.organization_employment, {
    patient_id,
    encounter: {
      create: true,
      to_create: form_values,
      patient_encounter_id: generateUUID()
    }
  });
  assert(current_workflow);
  const first_step = WORKFLOW_STEPS[current_workflow][0];
  return redirect(replaceParams(`/app/organizations/:organization_id/patients/:patient_id/open_encounter/${current_workflow}/${first_step}`, ctx.params));
});
async function PatientRegisteredIntakePage(ctx) {
  const {
    state: {
      trx,
      organization
    }
  } = ctx;
  const patient_id = getRequiredUUIDParam(ctx, "patient_id");
  const {
    patient,
    appointments_today_at_this_organization,
    closed_encounters_at_this_organization
  } = await promiseProps({
    patient: patients.getById(trx, patient_id, {
      include_incomplete_registration: false
    }),
    appointments_today_at_this_organization: appointments.getForPatient(trx, {
      patient_id,
      organization_id: organization.id,
      time_range: "today"
    }),
    closed_encounters_at_this_organization: patient_encounters.search(trx, {
      patient_id,
      organization_id: organization.id,
      is_closed: true
    })
  });
  console.log({
    patient,
    appointments_today_at_this_organization,
    closed_encounters_at_this_organization
  });
  return a($$_tpl_1);
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_registered_intake = PatientRegisteredIntakePage;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_registered_intake as default,
  handler,
  handlers
};
