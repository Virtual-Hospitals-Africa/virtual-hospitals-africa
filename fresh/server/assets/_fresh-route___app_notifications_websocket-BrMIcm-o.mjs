import { n as notifications, i as last } from "../server-entry.mjs";
import { u as upgradeWebsocket } from "./websocket-CnEsHi7E.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const notificationsWebsocket = upgradeWebsocket((ctx, socket) => {
  console.log("upgraded websocket");
  let timeout;
  let past_ts;
  async function loop() {
    console.log("notifications-websocket loop");
    const new_notifs = await notifications.ofHealthWorker(ctx.state.trx, ctx.state.health_worker.id);
    for (const new_notif of new_notifs) {
      console.log("new_notif weklewkl", new_notif);
      if (!past_ts || new_notif.created_at > past_ts) {
        socket.send(JSON.stringify(new_notif));
      }
      past_ts = new_notif.created_at;
    }
    timeout = setTimeout(loop, 150);
  }
  socket.onopen = async () => {
    const notifs = await notifications.ofHealthWorker(ctx.state.trx, ctx.state.health_worker.id);
    past_ts = last(notifs)?.created_at;
    await loop();
  };
  socket.onclose = () => clearTimeout(timeout);
  socket.onerror = () => {
    clearTimeout(timeout);
  };
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_notifications_websocket = notificationsWebsocket;
export {
  config,
  css,
  _freshRoute___app_notifications_websocket as default,
  handler,
  handlers
};
