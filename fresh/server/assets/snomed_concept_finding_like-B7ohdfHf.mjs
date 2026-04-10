import { aU as base, cw as identity, aI as sql, cx as FINDING_CONTEXT, cy as KNOWN_ABSENT, cz as idSelection, cA as CLINICAL_COURSE, cB as CHRONIC } from "../server-entry.mjs";
const FINDING_LIKE_CATEGORIES = ["finding", "disorder", "morphologic abnormality", "situation", "event"];
function baseQuery(trx, terms) {
  const has_rule_boost = sql`exists (
    select 1
    from snomed_concept_active_descendants_realized adr
    join due_to_findings df on df.specific_snomed_concept_id = adr.ancestor_id
    where adr.descendant_id = snomed_inferred_canonical_name_and_category.id
  )`;
  const best_similarity = terms.search ? sql`
    max(similarity(${terms.search}, term)) - (case
      when snomed_inferred_canonical_name_and_category.category = 'morphologic abnormality'
        then 0.9
      when snomed_inferred_canonical_name_and_category.category = 'event'
        then 0.7
      else 0
    end) + (case when ${has_rule_boost} then 0.4 else 0 end)
  ` : sql`(case when ${has_rule_boost} then 0.4 else 0 end)`;
  let query = trx.selectFrom("snomed_concept_finding_like").innerJoin("snomed_inferred_canonical_name_and_category", "snomed_inferred_canonical_name_and_category.id", "snomed_concept_finding_like.id").leftJoin("snomed_inferred_canonical_name_and_category as preferred_category_of_same_name", (join) => FINDING_LIKE_CATEGORIES ? join.on((eb) => eb.or(FINDING_LIKE_CATEGORIES.slice(1).flatMap((category, i) => {
    const higher_ranking_categories = FINDING_LIKE_CATEGORIES.slice(0, i + 1);
    return higher_ranking_categories.map((higher_ranking_category) => eb.and([eb("preferred_category_of_same_name.name", "=", eb.ref("snomed_inferred_canonical_name_and_category.name")), eb("snomed_inferred_canonical_name_and_category.category", "=", category), eb("preferred_category_of_same_name.category", "=", higher_ranking_category)]));
  }))) : join.on(sql`false`)).where("preferred_category_of_same_name.id", "is", null).where((eb) => eb.not(eb.exists(eb.selectFrom("snomed_relationship").whereRef("source_id", "=", "snomed_inferred_canonical_name_and_category.id").where("snomed_relationship.type_id", "=", FINDING_CONTEXT.id).where("snomed_relationship.destination_id", "=", KNOWN_ABSENT.id)))).select(["snomed_inferred_canonical_name_and_category.id", "snomed_inferred_canonical_name_and_category.name", "snomed_inferred_canonical_name_and_category.category", best_similarity.as("best_similarity")]).groupBy(["snomed_concept_finding_like.id", "snomed_inferred_canonical_name_and_category.id"]);
  if (terms.snomed_concept_id) {
    query = query.where("snomed_concept_finding_like.id", ...idSelection(terms.snomed_concept_id));
  }
  if (terms.search) {
    query = query.where(sql`${terms.search} <% term`).orderBy(best_similarity, "desc");
  }
  if (terms.chronic) {
    query = query.innerJoin("snomed_relationship", "snomed_relationship.source_id", "snomed_inferred_canonical_name_and_category.id").where("snomed_relationship.type_id", "=", CLINICAL_COURSE.id).where("snomed_relationship.destination_id", "=", CHRONIC.id);
  }
  return query;
}
const snomed_concept_finding_like = base({
  top_level_table: "snomed_concept_finding_like",
  baseQuery,
  formatResult: identity
});
export {
  snomed_concept_finding_like as s
};
