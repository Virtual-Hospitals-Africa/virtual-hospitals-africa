import { H as HealthWorkerHomePage, a } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ["TODO: organization page"];
const index = HealthWorkerHomePage(function OrganizationPage(ctx) {
  const {
    organization
  } = ctx.state;
  return {
    title: organization.name,
    children: a($$_tpl_1)
  };
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_index = index;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_index as default,
  handler,
  handlers
};
