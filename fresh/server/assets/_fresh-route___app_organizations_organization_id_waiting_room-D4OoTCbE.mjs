import { H as HealthWorkerHomePage, w as waiting_room$1, u, de as WaitingRoomView } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const waiting_room = HealthWorkerHomePage("Open Encounters", async function WaitingRoomPage(ctx) {
  const {
    trx,
    health_worker,
    organization,
    organization_employment
  } = ctx.state;
  const can_register_patients = !!organization.location;
  const open_encounters = await waiting_room$1.get(trx, health_worker, organization_employment);
  return u(WaitingRoomView, {
    organization_id: organization.id,
    waiting_room: open_encounters,
    can_register_patients
  });
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_waiting_room = waiting_room;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_waiting_room as default,
  handler,
  handlers
};
