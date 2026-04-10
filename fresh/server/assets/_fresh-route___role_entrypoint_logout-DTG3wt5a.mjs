import { eB as getSessionCookie, du as sessions, d as db, r as redirect, eC as deleteCookie, dw as session_key } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const handler$1 = {
  async GET(ctx) {
    const session_id = getSessionCookie(ctx.req);
    if (session_id) {
      await sessions.removeById(db, session_id);
    }
    const response = redirect("/");
    deleteCookie(response.headers, session_key);
    deleteCookie(response.headers, "health_worker_id");
    return response;
  }
};
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___role_entrypoint_logout = void 0;
export {
  config,
  css,
  _freshRoute___role_entrypoint_logout as default,
  handler,
  handlers
};
