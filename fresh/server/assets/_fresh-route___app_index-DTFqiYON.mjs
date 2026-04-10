import { r as redirect, f as defaultOrganizationId } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const handler$1 = function AppRedirectToWaitingRoomPage(ctx) {
  const {
    state,
    url
  } = ctx;
  return redirect(`/app/organizations/${defaultOrganizationId(state.health_worker)}/waiting_room`, url.searchParams);
};
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_index = void 0;
export {
  config,
  css,
  _freshRoute___app_index as default,
  handler,
  handlers
};
