import { S as assertEquals } from "../server-entry.mjs";
import { i as icd10 } from "./icd10-D7F7Fwv_.mjs";
import { j as json } from "./responses-Vcjs2Fhe.mjs";
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
    const req = ctx.req;
    assertEquals(req.headers.get("accept"), "application/json");
    const search = ctx.url.searchParams.get("search");
    if (!search) return json([]);
    const results = await icd10.searchTree(ctx.state.trx, {
      search,
      limit: 10
    });
    return json(results);
  }
};
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_icd10 = void 0;
export {
  config,
  css,
  _freshRoute___app_icd10 as default,
  handler,
  handlers
};
