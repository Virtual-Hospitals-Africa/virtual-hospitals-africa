import { a, u, J as FormSection, K as FormRow, R as RadioButtonGroup, Q as compact, T as TextArea, O as OpenEncounterWorkflowPage, S as assertEquals, m as assert, U as completedPersonal, y as completeLastStep, V as patient_workflows, X as objectPronoun, r as redirect, Y as success, F as object, G as string, _ as _enum, Z as canPerform, $ as assertOrRedirect, a0 as warning } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { p as patient_presence } from "./patient_presence-BDsaizBc.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ["", ""];
function RegistrationRoutePatientSection({
  this_visit,
  can_do_triage,
  patient_names,
  senior_health_worker_name: senior_health_worker_name2
}) {
  return a($$_tpl_1, u(FormSection, {
    header: "Next Step",
    children: [u(FormRow, {
      children: u(RadioButtonGroup, {
        name: "next_workflow",
        defaultValue: "await_triage",
        options: [{
          id: "await_triage",
          name: "Await triage prior to consultation",
          description: [`I will show ${patient_names.preferred_name} to the waiting room.`, `The next available health worker will triage ${patient_names.preferred_name} prior to consultation.`]
        }, {
          id: "immediate_triage",
          name: "Immediate transfer to triage",
          description: compact([`I will transfer ${patient_names.preferred_name} immediately to the triage area as this appears to be an urgent case`, can_do_triage ? null : `${senior_health_worker_name2} will be notified immediately to meet us in the triage area`])
        }, {
          id: "call_for_help",
          name: "Call for help in reception area",
          description: [`I will stay here in reception with ${patient_names.preferred_name}`, `${senior_health_worker_name2} will be notified immediately to join us in reception`]
        }]
      })
    }), u(FormRow, {
      children: u(TextArea, {
        name: "notes",
        label: "Additional notes",
        value: this_visit.notes
      })
    })]
  }));
}
const senior_health_worker_name = "Nomsa Moyo";
const PatientRegistrationRoutePatientSchema = object({
  next_workflow: _enum(["await_triage", "immediate_triage", "call_for_help"]),
  notes: string().optional()
});
const handler$1 = postHandler(PatientRegistrationRoutePatientSchema, async (ctx, {
  next_workflow
  /*, notes */
}) => {
  const {
    trx,
    patient,
    encounter,
    organization,
    organization_employment
  } = ctx.state;
  assertEquals(next_workflow, "await_triage");
  assert(!encounter.workflows.triage);
  assert(completedPersonal(patient));
  const patient_presence_updates = {
    current_workflow: null,
    department_name: "Waiting room",
    next_workflow: "triage"
  };
  await Promise.all([completeLastStep(ctx), patient_workflows.insertMany(trx, [{
    patient_encounter_id: encounter.patient_encounter_id,
    workflow: "triage"
  }, {
    patient_encounter_id: encounter.patient_encounter_id,
    workflow: "consultation"
  }]), patient_presence.set(trx, patient.id, patient_presence_updates), trx.updateTable("employment_presence").set({
    with_patient_id: null
  }).where("employment_presence.id", "=", organization_employment.employment_id).execute()]);
  const redirect_success_message = `Please escort ${patient.names.preferred_name} to the waiting room. The next available triage nurse will see ${objectPronoun(patient)}.`;
  return redirect(success(redirect_success_message, `/app/organizations/${organization.id}/waiting_room`));
});
async function PatientRegistrationRoutePatientPage(ctx) {
  const {
    patient,
    organization_employment,
    encounter: {
      reason,
      notes
    }
  } = ctx.state;
  const can_do_triage = !!canPerform(organization_employment, "triage");
  assertOrRedirect(patient.names, warning("The personal section must be completed first", ctx.url.pathname.replace("/this_visit", "/personal")));
  return u(RegistrationRoutePatientSection, {
    this_visit: {
      reason,
      notes
    },
    patient_names: patient.names,
    senior_health_worker_name,
    can_do_triage
  });
}
const route_patient = OpenEncounterWorkflowPage(PatientRegistrationRoutePatientPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_registration_route_patient = route_patient;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_registration_route_patient as default,
  handler,
  handlers
};
