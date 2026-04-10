import { a, b as s, u, l } from "../server-entry.mjs";
import { M as MOCK_PATIENTS } from "./patients-BMkJhz-y.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ['<div class="min-h-screen bg-gray-100 p-8"><div class="max-w-4xl mx-auto"><h1 class="text-2xl font-bold text-gray-900 mb-2">Example Patient Cases</h1><p class="text-gray-600 mb-8">Select a patient case to view the warning signs page and patient drawer with mock data.</p><div class="grid gap-4">', "</div></div></div>"];
const $$_tpl_2 = ['<div class="flex items-start justify-between"><div class="flex items-center">', '<div><h2 class="text-lg font-semibold text-gray-900">', '</h2><p class="text-sm text-gray-500">', "</p></div></div>", '</div><p class="text-sm text-gray-600 mt-3">', '</p><div class="mt-4 flex flex-wrap gap-2">', "", "</div>"];
const $$_tpl_3 = ["<span ", ">", "</span>"];
const $$_tpl_4 = ["<span ", ' class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">', "</span>"];
const $$_tpl_5 = ['<span class="text-xs text-gray-500">+', " more</span>"];
function ExamplePatientsIndexPage() {
  return a($$_tpl_1, s(MOCK_PATIENTS.map((patient) => u("a", {
    href: `/example/patients/${patient.key}`,
    class: "block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all",
    children: a($$_tpl_2, u("img", {
      src: patient.patient.avatar_url ?? "/images/avatars/default.png",
      alt: patient.patient.name,
      class: "w-12 h-12 rounded-full mr-4"
    }), s(patient.patient.name), s(patient.patient.description), s(patient.priority && a($$_tpl_3, l("class", `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${patient.priority === "Emergency" ? "bg-red-100 text-red-800" : patient.priority === "Very urgent" ? "bg-orange-100 text-orange-800" : patient.priority === "Urgent" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`), s(patient.priority))), s(patient.description), s(patient.patient_history.pre_existing_conditions.slice(0, 3).map((condition) => a($$_tpl_4, l("key", condition.id), s(condition.displays.finding)))), s(patient.patient_history.pre_existing_conditions.length > 3 && a($$_tpl_5, s(patient.patient_history.pre_existing_conditions.length - 3))))
  }, patient.key))));
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___example_patients_index = ExamplePatientsIndexPage;
export {
  config,
  css,
  _freshRoute___example_patients_index as default,
  handler,
  handlers
};
