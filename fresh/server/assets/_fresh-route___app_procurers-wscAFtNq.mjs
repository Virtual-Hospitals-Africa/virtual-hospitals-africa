import { aU as base } from "../server-entry.mjs";
import { j as jsonSearchHandler } from "./jsonSearchHandler-Bfi3q4C9.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./responses-Vcjs2Fhe.mjs";
const procurers = base({
  top_level_table: "procurers",
  baseQuery: (trx, opts) => trx.selectFrom("procurers").select(["procurers.id", "procurers.name"]).$if(!!opts.search, (qb) => qb.where("procurers.name", "ilike", `%${opts.search}%`)),
  formatResult: (x) => x
});
const handler$1 = jsonSearchHandler(procurers);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_procurers = void 0;
export {
  config,
  css,
  _freshRoute___app_procurers as default,
  handler,
  handlers
};
