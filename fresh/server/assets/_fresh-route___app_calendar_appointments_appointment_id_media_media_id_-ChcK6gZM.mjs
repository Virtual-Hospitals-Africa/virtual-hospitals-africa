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
      appointment_id,
      media_id
    } = ctx.params;
    const appointment_media = await media.findOne(ctx.state.trx, {
      media_id,
      appointment_id
    });
    const media_data = appointment_media.binary_data;
    return file(media_data, appointment_media.mime_type);
  }
};
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_calendar_appointments_appointment_id_media_media_id_ = void 0;
export {
  config,
  css,
  _freshRoute___app_calendar_appointments_appointment_id_media_media_id_ as default,
  handler,
  handlers
};
