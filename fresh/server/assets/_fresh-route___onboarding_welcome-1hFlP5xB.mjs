import { u, eA as Onboarding, et as organizationDepartmentIdsOfProfession, m as assert, eu as health_worker_licences, al as SERVER_COUNTRY, r as redirect, F as object, G as string, _ as _enum } from "../server-entry.mjs";
import { J as JustLogoLayout } from "./JustLogoLayout-CBo8Mo4Y.mjs";
import { o as organizations_with_departments, e as employment } from "./organizations_with_departments-D1x0hCCJ.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./Footer-CjAnK5R7.mjs";
const OnboardingSchema = object({
  organization_id: string().uuid(),
  profession: _enum(["nurse", "doctor"]),
  specialty: string()
}).or(object({
  organization_id: string().uuid(),
  profession: _enum(["receptionist"])
}));
const handler$1 = postHandler(OnboardingSchema, async (ctx, form_values) => {
  const {
    trx,
    health_worker
  } = ctx.state;
  const {
    organization_id,
    profession
  } = form_values;
  const specialty = "specialty" in form_values ? form_values.specialty : null;
  const organization = await organizations_with_departments.getById(trx, organization_id);
  const department_ids = organizationDepartmentIdsOfProfession(organization, profession, specialty);
  const result = await employment.addOne(trx, {
    department_ids,
    organization_id,
    role: profession,
    health_worker_id: health_worker.id,
    is_admin: false
  });
  assert(result.id);
  await Promise.all([health_worker_licences.insertTest(trx, {
    health_worker_id: result.health_worker_id,
    country: SERVER_COUNTRY,
    role: profession,
    specialty
  }), trx.insertInto("employment_presence").values({
    id: result.id,
    at_work: true
  }).execute()]);
  return redirect("/app");
});
async function OnboardingPage(ctx) {
  const test_organizations = await organizations_with_departments.search(ctx.state.trx, {
    is_test: true
  });
  return u(JustLogoLayout, {
    url: ctx.url,
    title: "Virtual Hospitals Africa",
    children: u(Onboarding, {
      health_worker: ctx.state.health_worker,
      organizations: test_organizations.results
    })
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___onboarding_welcome = OnboardingPage;
export {
  config,
  css,
  _freshRoute___onboarding_welcome as default,
  handler,
  handlers
};
