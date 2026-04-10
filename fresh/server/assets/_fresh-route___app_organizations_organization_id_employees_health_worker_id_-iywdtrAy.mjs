import { a, b as s, l, H as HealthWorkerHomePage, g as getRequiredUUIDParam, au as employees, e as assertOr404, u } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1$1 = ['<div><div class="mt-6"><dl class="grid grid-cols-1 sm:grid-cols-4"><div class="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0"><dt class="text-sm font-bold leading-6 text-gray-900">First Name(s)</dt><dd class="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">', '</dd></div><div class="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0"><dt class="text-sm font-bold leading-6 text-gray-900">Surname</dt><dd class="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">', '</dd></div><div class="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0"><dt class="text-sm font-bold leading-6 text-gray-900">Gender</dt><dd class="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">', '</dd></div><div class="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0"><dt class="text-sm font-bold leading-6 text-gray-900">Date of Birth</dt><dd class="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">', '</dd></div><div class="py-6 sm:col-span-1 sm:px-0"><dt class="text-sm font-bold leading-6 text-gray-900">Email</dt><dd class="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">', '</dd></div><div class="py-6 sm:col-span-1 sm:px-0"><dt class="text-sm font-bold leading-6 text-gray-900">Phone Number</dt><dd class="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">', '</dd></div><div class="py-6 sm:col-span-2 sm:px-0"><dt class="text-sm font-bold leading-6 text-gray-900">Address</dt><dd class="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">', '</dd></div><div class="border-t border-gray-100 px-4 py-6 sm:col-span-4 sm:px-0"><dt class="text-sm font-bold leading-6 text-gray-900">Licences</dt>', '</div><div class="border-t border-gray-100 px-4 py-6 sm:col-span-4 sm:px-0"><dt class="text-sm font-bold leading-6 text-gray-900">Organizations</dt>', "</div></dl></div></div>"];
const $$_tpl_2 = ['<dd class="mt-2 text-sm text-gray-900"><table class="min-w-full divide-y divide-gray-300"><thead><tr><th class="py-2 pr-3 text-left text-sm font-semibold text-gray-900">Agency</th><th class="py-2 pr-3 text-left text-sm font-semibold text-gray-900">Licence Number</th><th class="py-2 pr-3 text-left text-sm font-semibold text-gray-900">Profession</th><th class="py-2 pr-3 text-left text-sm font-semibold text-gray-900">Specialty</th><th class="py-2 pr-3 text-left text-sm font-semibold text-gray-900">Expiry</th></tr></thead><tbody class="divide-y divide-gray-200">', "</tbody></table></dd>"];
const $$_tpl_3 = ["<tr ", '><td class="py-2 pr-3 text-sm text-gray-700">', " (", ')</td><td class="py-2 pr-3 text-sm text-gray-700">', '</td><td class="py-2 pr-3 text-sm text-gray-700">', '</td><td class="py-2 pr-3 text-sm text-gray-700">', '</td><td class="py-2 pr-3 text-sm text-gray-700">', "</td></tr>"];
const $$_tpl_4 = ['<dd class="mt-2 text-sm leading-6 text-gray-700">No active licences</dd>'];
const $$_tpl_5 = ['<dd class="mt-2 text-sm text-gray-900">', "</dd>"];
const $$_tpl_6 = ["<div ", ' class="mb-2"><div class="font-medium">', '</div><div class="pl-4 text-xs text-gray-500">', '</div><div class="pl-4 text-xs text-gray-500">Role: ', "</div></div>"];
const $$_tpl_7 = ['<dd class="mt-2 text-sm leading-6 text-gray-700">No organizations</dd>'];
function HealthWorkerDetailedCard({
  employee
}) {
  const all_licences = employee.organizations.flatMap((org) => org.active_licences);
  return a($$_tpl_1$1, s(employee.first_names), s(employee.surname), s(employee.demographics.gender || "N/A"), s(employee.demographics.date_of_birth ? String(employee.demographics.date_of_birth) : "N/A"), s(employee.email || "N/A"), s(employee.contact_details.mobile_phone_number || "N/A"), s(employee.contact_details.address?.formatted || "N/A"), s(all_licences.length > 0 ? a($$_tpl_2, s(all_licences.map((licence) => a($$_tpl_3, l("key", licence.licence_number), s(licence.regulatory_agency.acronym), s(licence.regulatory_agency.country), s(licence.licence_number), s(licence.profession), s(licence.specialty?.replaceAll("_", " ") || "N/A"), s(String(licence.expiry_date)))))) : a($$_tpl_4)), s(employee.organizations.length > 0 ? a($$_tpl_5, s(employee.organizations.map((org) => a($$_tpl_6, l("key", org.id), s(org.name), s(org.formatted_address || "N/A"), s(org.role))))) : a($$_tpl_7)));
}
const $$_tpl_1 = ['<div class="mt-4 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full"><div class="my-6 overflow-hidden bg-slate-50">', '<dt class="mt-2 text-lg font-bold leading-6 text-gray-900">', '</dt><dt class="text-sm font-sm leading-6 text-gray-400">', "</dt></div>", "</div><hr ", ">"];
const _health_worker_id_ = HealthWorkerHomePage(async function EmployeePage(ctx) {
  const {
    trx,
    organization
  } = ctx.state;
  const health_worker_id = getRequiredUUIDParam(ctx, "health_worker_id");
  const employee = await employees.findOne(trx, {
    health_worker_id,
    organization_id: organization.id
  });
  assertOr404(employee, `Clinics/organizations not found for health worker ${health_worker_id}`);
  return {
    title: employee.name,
    children: a($$_tpl_1, u("img", {
      class: "h-20 w-20 object-cover display:inline rounded-full",
      src: `${employee.avatar_url}`,
      alt: "",
      width: 48,
      height: 48
    }), s(employee.name), s(employee.role), u(HealthWorkerDetailedCard, {
      employee
    }), l("style", {
      margin: "20px 0"
    }))
  };
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_employees_health_worker_id_ = _health_worker_id_;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_employees_health_worker_id_ as default,
  handler,
  handlers
};
