import { g as getRequiredUUIDParam, h as health_workers, d as db, e as assertOr404 } from "../server-entry.mjs";
import { f as file } from "./responses-Vcjs2Fhe.mjs";
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
    const health_worker_id = getRequiredUUIDParam(ctx, "health_worker_id");
    const avatar = await health_workers.getAvatar(db, {
      health_worker_id
    });
    assertOr404(avatar);
    const response = file(avatar.binary_data, avatar.mime_type);
    response.headers.set("cache-control", "public, max-age=86400, immutable");
    return response;
  }
};
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___health_workers_health_worker_id_avatar = void 0;
export {
  config,
  css,
  _freshRoute___health_workers_health_worker_id_avatar as default,
  handler,
  handlers
};
