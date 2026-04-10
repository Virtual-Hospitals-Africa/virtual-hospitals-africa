import { f as file } from "./responses-Vcjs2Fhe.mjs";
import { m as media } from "./media-DY7RW76U.mjs";
import "../server-entry.mjs";
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
    const {
      media_id
    } = ctx.params;
    const health_worker_media = await media.getById(ctx.state.trx, media_id);
    return file(health_worker_media.binary_data, health_worker_media.mime_type);
  }
};
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_employees_health_worker_id_media_media_id_ = void 0;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_employees_health_worker_id_media_media_id_ as default,
  handler,
  handlers
};
