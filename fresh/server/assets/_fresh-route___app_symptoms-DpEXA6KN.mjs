import { j as jsonSearchHandler } from "./jsonSearchHandler-Bfi3q4C9.mjs";
import { aU as base } from "../server-entry.mjs";
import "./responses-Vcjs2Fhe.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const symptoms = base({
  top_level_table: "snomed_inferred_canonical_name_and_category",
  baseQuery: (trx, opts) => trx.selectFrom("snomed_inferred_canonical_name_and_category").select(["snomed_inferred_canonical_name_and_category.id", "snomed_inferred_canonical_name_and_category.name"]).where("snomed_inferred_canonical_name_and_category.category", "=", "finding").$if(!!opts.search, (qb) => qb.where("snomed_inferred_canonical_name_and_category.name", "ilike", `%${opts.search}%`)),
  formatResult: (x) => x
});
const handler$1 = jsonSearchHandler(symptoms);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_symptoms = void 0;
export {
  config,
  css,
  _freshRoute___app_symptoms as default,
  handler,
  handlers
};
