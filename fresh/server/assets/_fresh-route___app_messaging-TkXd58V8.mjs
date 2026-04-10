import { H as HealthWorkerHomePage, dK as message_threads, u, dL as ThreadList } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const messaging = HealthWorkerHomePage("Messaging", async function MessagingPage(ctx) {
  const threads = await message_threads.getForHealthWorker(ctx.state.trx, ctx.state.health_worker);
  return u(ThreadList, {
    threads
  });
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_messaging = messaging;
export {
  config,
  css,
  _freshRoute___app_messaging as default,
  handler,
  handlers
};
