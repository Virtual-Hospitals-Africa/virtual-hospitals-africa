import { j as jsonSearchHandler } from "./jsonSearchHandler-Bfi3q4C9.mjs";
import { aU as base, dM as FAMILY_HISTORY_WITH_EXPLICIT_CONTEXT } from "../server-entry.mjs";
import "./responses-Vcjs2Fhe.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const family_history = base({
  top_level_table: "snomed_inferred_canonical_name_and_category",
  baseQuery: (trx, opts) => trx.selectFrom("snomed_inferred_canonical_name_and_category").innerJoin("snomed_concept_active_descendants_realized", (join) => join.onRef("snomed_concept_active_descendants_realized.descendant_id", "=", "snomed_inferred_canonical_name_and_category.id").on("snomed_concept_active_descendants_realized.ancestor_id", "=", FAMILY_HISTORY_WITH_EXPLICIT_CONTEXT.id)).select(["snomed_inferred_canonical_name_and_category.id", "snomed_inferred_canonical_name_and_category.name"]).$if(!!opts.search, (qb) => qb.where("snomed_inferred_canonical_name_and_category.name", "ilike", `%${opts.search}%`).orderBy("snomed_inferred_canonical_name_and_category.name", "asc")),
  formatResult: (x) => x
});
const handler$1 = jsonSearchHandler(family_history);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_family_history = void 0;
export {
  config,
  css,
  _freshRoute___app_family_history as default,
  handler,
  handlers
};
