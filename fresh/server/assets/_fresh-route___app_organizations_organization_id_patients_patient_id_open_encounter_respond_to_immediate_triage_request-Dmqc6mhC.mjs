import { H as HealthWorkerHomePage, g as getRequiredUUIDParam, k as patient_encounters, e as assertOr404, at as presentWithPatient, au as employees, a, u, B as Button, av as Form, b as s, l, aw as employeeDisplay, ax as Person, ay as capitalize } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ['<div class="p-6"><h3 class="text-lg font-semibold mb-4">Patient Information</h3><div class="space-y-4"><div class="flex items-center pb-4 border-b border-gray-200">', "</div>", "", "", "", "", "", "</div></div>"];
const $$_tpl_2 = ['<div><span class="text-sm font-medium text-gray-700">Date of Birth</span><p class="text-sm text-gray-900 mt-1">', "</p></div>"];
const $$_tpl_3 = ['<div><span class="text-sm font-medium text-gray-700">Sex</span><p class="text-sm text-gray-900 mt-1">', "</p></div>"];
const $$_tpl_4 = ['<div><span class="text-sm font-medium text-gray-700">Age</span><p class="text-sm text-gray-900 mt-1">', "</p></div>"];
const $$_tpl_5 = ['<div><span class="text-sm font-medium text-gray-700">National ID</span><p class="text-sm text-gray-900 mt-1">', "</p></div>"];
const $$_tpl_6 = ['<div><span class="text-sm font-medium text-gray-700">Reason for Visit</span><p class="text-sm text-gray-900 mt-1">', "</p></div>"];
const $$_tpl_7 = ['<div><span class="text-sm font-medium text-gray-700">Notes</span><p class="text-sm text-gray-900 mt-1">', "</p></div>"];
const $$_tpl_8 = ['<div class="p-6 max-w-4xl"><div class="mb-6"><h2 class="text-2xl font-semibold mb-2">Immediate Triage Request</h2><p class="text-gray-600">A health worker has requested immediate triage for this patient.</p></div><div class="mb-6"><h3 class="text-lg font-semibold mb-4">Patient Summary</h3><div class="bg-white shadow rounded-lg p-6"><div class="flex items-center">', '<div><h4 class="text-xl font-semibold">', '</h4><p class="text-gray-600">', "</p></div></div></div></div>", "", '<div class="flex gap-4">', "", "</div></div>"];
const $$_tpl_9 = ['<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"><h3 class="text-lg font-semibold mb-3 text-blue-900">Already Responding</h3><p class="text-sm text-blue-700 mb-3">The following health workers are currently with this patient:</p><div class="space-y-2">', "</div></div>"];
const $$_tpl_10 = ["<div ", ' class="flex items-center bg-white rounded px-3 py-2">', "</div>"];
const $$_tpl_11 = ['<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"><h3 class="text-lg font-semibold mb-2 text-yellow-900">No One Responding Yet</h3><p class="text-sm text-yellow-700">No health workers are currently responding to this request.</p></div>'];
const respondToImmediateTriageRequest = HealthWorkerHomePage("Immediate Triage Request", async function RespondToImmediateTriageRequestPage(ctx) {
  const {
    trx,
    organization
  } = ctx.state;
  const patient_id = getRequiredUUIDParam(ctx, "patient_id");
  const patient_encounter = await patient_encounters.getFirstOpen(trx, {
    patient_id
  });
  assertOr404(patient_encounter, "No open encounter for this patient at this organization");
  const {
    patient
  } = patient_encounter;
  const present_with_patient = presentWithPatient(patient_encounter);
  const present_with_patient_employees = present_with_patient.length ? await employees.getByIds(trx, present_with_patient.map((e) => e.employee_id)) : [];
  return {
    drawer: a($$_tpl_1, u(Person, {
      person: {
        ...patient,
        display_name: patient.name || "[Unnamed Patient]"
      }
    }), s(patient.date_of_birth && a($$_tpl_2, s(patient.dob_formatted))), s(patient.sex && a($$_tpl_3, s(capitalize(patient.sex)))), s(patient.age_display && a($$_tpl_4, s(patient.age_display))), s(patient.national_id_number && a($$_tpl_5, s(patient.national_id_number))), s(patient_encounter.reason && a($$_tpl_6, s(capitalize(patient_encounter.reason)))), s(patient_encounter.notes && a($$_tpl_7, s(patient_encounter.notes)))),
    children: a($$_tpl_8, s(patient.avatar_url && u("img", {
      src: patient.avatar_url,
      alt: patient.name || "Patient",
      class: "w-16 h-16 rounded-full mr-4"
    })), s(patient.name || "[Unnamed Patient]"), s(patient.description), s(present_with_patient_employees.length > 0 && a($$_tpl_9, s(present_with_patient_employees.map((employee) => a($$_tpl_10, l("key", employee.employee_id), u(Person, {
      person: {
        ...employee,
        ...employeeDisplay(employee)
      }
    })))))), s(present_with_patient.length === 0 && a($$_tpl_11)), u(Form, {
      method: "POST",
      action: `/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/start-workflow`,
      children: u(Button, {
        type: "submit",
        variant: "primary",
        name: "workflow",
        value: "triage",
        className: "px-6 py-3",
        children: "Start Triage"
      })
    }), u("a", {
      href: `/app/organizations/${organization.id}/waiting_room`,
      class: "inline-flex justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
      children: "Back to Waiting Room"
    }))
  };
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_respond_to_immediate_triage_request = respondToImmediateTriageRequest;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_respond_to_immediate_triage_request as default,
  handler,
  handlers
};
