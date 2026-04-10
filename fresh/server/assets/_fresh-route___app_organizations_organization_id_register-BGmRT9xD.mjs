import { r as redirect } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const handler$1 = {
  // deno-lint-ignore no-explicit-any
  GET(ctx) {
    return redirect(ctx.url.pathname + "/personal");
  }
};
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_register = void 0;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_register as default,
  handler,
  handlers
};
