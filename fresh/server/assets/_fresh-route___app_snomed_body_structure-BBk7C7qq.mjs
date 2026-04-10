import { aU as base, cw as identity, v as assertOr400, aI as sql, bf as jsonArrayFrom, m as assert } from "../server-entry.mjs";
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
  let query = trx.selectFrom("snomed_concept_body_structure").innerJoin("snomed_inferred_canonical_name_and_category", "snomed_inferred_canonical_name_and_category.id", "snomed_concept_body_structure.id").where(sql`term % ${terms.search}`).select((eb) => ["snomed_inferred_canonical_name_and_category.id", "snomed_inferred_canonical_name_and_category.name", "snomed_inferred_canonical_name_and_category.category", best_similarity.as("best_similarity"), jsonArrayFrom(eb.selectFrom("snomed_relationship").innerJoin("snomed_concept", "snomed_concept.id", "snomed_relationship.source_id").innerJoin("snomed_inferred_canonical_name_and_category as desc_info", "desc_info.id", "snomed_relationship.source_id").whereRef("snomed_relationship.destination_id", "=", "snomed_inferred_canonical_name_and_category.id").where("snomed_relationship.active", "=", true).where("snomed_concept.active", "=", true).where("snomed_relationship.type_id", "=", "116680003").select(["desc_info.id", "desc_info.name", "desc_info.category"])).as("immediate_descendants"), eb.selectFrom(sql`active_descendant_snomed_concepts(${eb.ref("snomed_inferred_canonical_name_and_category.id")})`.as("d")).where(sql`cardinality(d.ancestor_ids) >= 1`).select((eb2) => eb2.fn.countAll().as("count")).as("total_descendants")]).groupBy("snomed_inferred_canonical_name_and_category.id").orderBy(best_similarity, "desc");
  if (terms.descendant_of_snomed_concept_id) {
    const ancestor_id = terms.descendant_of_snomed_concept_id;
    query = query.where((eb) => eb("snomed_concept_body_structure.id", "in", eb.selectFrom(sql`active_descendant_snomed_concepts(${ancestor_id})`.as("d")).select("d.descendant_id")));
  }
  if (terms.descendant_of_snomed_concept_name) {
    assert(terms.descendant_of_snomed_concept_category);
    const name = terms.descendant_of_snomed_concept_name;
    const category = terms.descendant_of_snomed_concept_category;
    query = query.where((eb) => eb("snomed_concept_body_structure.id", "in", eb.selectFrom(sql`active_descendant_snomed_concepts(
            (select id from snomed_inferred_canonical_name_and_category where name = ${name} and category = ${category} limit 1)
          )`.as("d")).select("d.descendant_id")));
  }
  return query;
}
const snomed_concept_body_structure = base({
  top_level_table: "snomed_concept_body_structure",
  baseQuery,
  formatResult: identity
});
const handler$1 = jsonSearchHandler(snomed_concept_body_structure);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_snomed_body_structure = void 0;
export {
  config,
  css,
  _freshRoute___app_snomed_body_structure as default,
  handler,
  handlers
};
