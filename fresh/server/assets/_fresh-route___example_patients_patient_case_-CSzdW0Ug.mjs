import { a, b as s, l, u, el as ExamplePatientView } from "../server-entry.mjs";
import { g as getMockPatientByKey, M as MOCK_PATIENTS } from "./patients-BMkJhz-y.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ['<div class="min-h-screen bg-gray-100 p-8"><div class="max-w-4xl mx-auto"><h1 class="text-2xl font-bold text-gray-900 mb-4">Patient Case Not Found</h1><p class="text-gray-600 mb-6">The patient case &quot;', '&quot; was not found.</p><h2 class="text-lg font-semibold text-gray-800 mb-3">Available Patient Cases:</h2><ul class="space-y-2">', "</ul></div></div>"];
const $$_tpl_2 = ["<li ", ">", '<span class="text-gray-500 ml-2">- ', "</span></li>"];
function ExamplePatientPage(ctx) {
  const patient_case = ctx.params.patient_case;
  const mock_patient = getMockPatientByKey(patient_case);
  if (!mock_patient) {
    return a($$_tpl_1, s(patient_case), s(MOCK_PATIENTS.map((patient) => a($$_tpl_2, l("key", patient.key), u("a", {
      href: `/example/patients/${patient.key}`,
      class: "text-blue-600 hover:text-blue-800 underline",
      children: patient.key
    }), s(patient.description)))));
  }
  return u(ExamplePatientView, {
    url: ctx.url,
    route: ctx.route,
    mock_patient
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___example_patients_patient_case_ = ExamplePatientPage;
export {
  config,
  css,
  _freshRoute___example_patients_patient_case_ as default,
  handler,
  handlers
};
