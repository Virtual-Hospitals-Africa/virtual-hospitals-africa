import { z } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const handler$1 = postHandler(z.object({}), (_ctx) => {
  return new Response("OK");
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_test_always_passes = void 0;
export {
  config,
  css,
  _freshRoute___app_test_always_passes as default,
  handler,
  handlers
};
