import { m as media } from "./media-DY7RW76U.mjs";
import { f as file } from "./responses-Vcjs2Fhe.mjs";
import { e as assertOr404 } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const handler$1 = {
  async GET({
    state,
    params
  }) {
    const requested_media = await media.getById(state.trx, params.uuid);
    assertOr404(requested_media, "Could not find file");
    return file(requested_media.binary_data, requested_media.mime_type);
  }
};
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_media_uuid_ = void 0;
export {
  config,
  css,
  _freshRoute___app_media_uuid_ as default,
  handler,
  handlers
};
