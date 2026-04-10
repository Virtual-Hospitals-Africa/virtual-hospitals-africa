import { aU as base, cw as identity, v as assertOr400, aI as sql, dd as jsonArrayFromColumn, d$ as ALLERGIC_DISPOSITION } from "../server-entry.mjs";
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
function baseQuery(trx, terms) {
  assertOr400(terms.search, "Must be searching for a term");
  const best_similarity = sql`max(similarity(term, ${terms.search}))`;
  return trx.selectFrom("snomed_inferred_canonical_name_and_category").innerJoin("snomed_description", "snomed_inferred_canonical_name_and_category.id", "snomed_description.concept_id").leftJoin("snomed_inferred_canonical_name_and_category as preferred_category_of_same_name", (join) => terms.categories ? join.on((eb) => eb.or(terms.categories.slice(1).flatMap((category, i) => {
    const higher_ranking_categories = terms.categories.slice(0, i + 1);
    return higher_ranking_categories.map((higher_ranking_category) => eb.and([eb("preferred_category_of_same_name.name", "=", eb.ref("snomed_inferred_canonical_name_and_category.name")), eb("snomed_inferred_canonical_name_and_category.category", "=", category), eb("preferred_category_of_same_name.category", "=", higher_ranking_category)]));
  }))) : join.on(sql`false`)).where("preferred_category_of_same_name.id", "is", null).where(sql`term % ${terms.search}`).$if(!!terms.descendant_of_concept, (qb) => qb.innerJoin("snomed_concept_active_descendants_realized as allergy_descendant_filter", (join) => join.onRef("allergy_descendant_filter.descendant_id", "=", "snomed_description.concept_id").on("allergy_descendant_filter.ancestor_id", "=", terms.descendant_of_concept.id))).$if(!!terms.categories, (qb) => qb.where("snomed_inferred_canonical_name_and_category.category", "in", terms.categories)).select((eb) => ["snomed_inferred_canonical_name_and_category.id", "snomed_inferred_canonical_name_and_category.name", "snomed_inferred_canonical_name_and_category.category", jsonArrayFromColumn("term", eb.selectFrom("snomed_description as aliases").where("aliases.concept_id", "=", eb.ref("snomed_inferred_canonical_name_and_category.id")).where("aliases.term", "!=", eb.ref("snomed_inferred_canonical_name_and_category.name")).where("aliases.id", "!=", eb.ref("snomed_inferred_canonical_name_and_category.description_id")).where("aliases.active", "=", true).select("aliases.term")).as("description"), best_similarity.as("best_similarity")]).groupBy("snomed_inferred_canonical_name_and_category.id").orderBy(best_similarity, "desc");
}
const snomed_allergies = base({
  top_level_table: "snomed_inferred_canonical_name_and_category",
  baseQuery,
  formatResult: identity
});
const handler$1 = jsonSearchHandler(snomed_allergies, (ctx) => ({
  search: `Allergy to ${ctx.url.searchParams.get("search") || ""}`,
  descendant_of_concept: ALLERGIC_DISPOSITION
}), {
  rows_per_page: 5
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_snomed_allergies = void 0;
export {
  config,
  css,
  _freshRoute___app_snomed_allergies as default,
  handler,
  handlers
};
