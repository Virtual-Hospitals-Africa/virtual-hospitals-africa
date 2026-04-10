import { bQ as formatRecord, ch as groupBy, bC as patient_record_providers, Q as compact, ci as fromEntries, cj as temporaryTable, bz as patient_findings, m as assert, ck as first, cl as commonConditionSnomedConcept } from "../server-entry.mjs";
function mostRecentRecords(trx, {
  patient_id,
  conditions
}) {
  return trx.with("common_conditions", () => temporaryTable(trx, conditions)).with("patient_findings_matching_common_conditions", (qb) => qb.selectFrom("patient_findings").innerJoin("patient_records", "patient_findings.id", "patient_records.id").innerJoin("patient_records_still_valid", "patient_records_still_valid.id", "patient_findings.id").where("patient_records.patient_id", "=", patient_id).innerJoin("snomed_concept_active_descendants_realized as brief_history_descendants", (join) => join.onRef("brief_history_descendants.descendant_id", "=", "patient_records.specific_snomed_concept_id")).innerJoin("common_conditions", (join) => join.onRef("brief_history_descendants.ancestor_id", "=", "common_conditions.snomed_concept_id")).select((eb) => ["patient_findings.id", eb.ref("common_conditions.key").$castTo().as("pertaining_to_key")])).with("this_patient_findings", (qb) => patient_findings.searchQuery(trx, {
    patient_id,
    include_negative: true
  }).innerJoin(qb.selectFrom("patient_findings_matching_common_conditions").selectAll("patient_findings_matching_common_conditions").as("pfmcc"), (join) => join.onRef("patient_records_aggregated.id", "=", "pfmcc.id")).select(["pfmcc.pertaining_to_key"])).selectFrom("this_patient_findings").selectAll("this_patient_findings").orderBy("this_patient_findings.created_at", "desc").execute();
}
function mostRecentRecord(findings_of_condition) {
  if (findings_of_condition.length > 1) {
    assert(findings_of_condition[0].created_at >= findings_of_condition[1].created_at);
  }
  const {
    pertaining_to_key
  } = first(findings_of_condition);
  const parent_snomed_concept_id = commonConditionSnomedConcept(pertaining_to_key)?.id;
  assert(parent_snomed_concept_id);
  const findings_of_condition_grouped_by_concept = groupBy(findings_of_condition, (f) => f.specific_snomed_concept_id);
  const most_recent_parent_concept_finding = first(findings_of_condition_grouped_by_concept.get(parent_snomed_concept_id) || []);
  const first_positive_finding_not_invalidated_by_a_later_negative_finding = findings_of_condition.find((finding) => {
    if (finding.existence !== "Yes") return;
    const most_recent_finding_of_concept = first(findings_of_condition_grouped_by_concept.get(finding.specific_snomed_concept_id));
    assert(most_recent_finding_of_concept);
    if (finding !== most_recent_finding_of_concept) return false;
    const invalidated = most_recent_parent_concept_finding && most_recent_parent_concept_finding.existence !== "Yes" && most_recent_parent_concept_finding.created_at > finding.created_at;
    return !invalidated;
  });
  if (first_positive_finding_not_invalidated_by_a_later_negative_finding) {
    return first_positive_finding_not_invalidated_by_a_later_negative_finding;
  }
  return most_recent_parent_concept_finding ?? null;
}
const brief_history = {
  mostRecentRecords,
  async renderedMostRecentRecords(trx, {
    patient_id,
    encounter,
    health_worker_id,
    conditions
  }) {
    const most_recent_findings = await mostRecentRecords(trx, {
      patient_id,
      conditions
    }).then((findings) => findings.map(formatRecord));
    const most_recent_grouped = groupBy(most_recent_findings, "pertaining_to_key").values().map(mostRecentRecord).toArray();
    const with_providers = await patient_record_providers.hydrateIntermediateRecords(trx, {
      encounter,
      health_worker_id,
      records: compact(most_recent_grouped)
    });
    return fromEntries(conditions.map((condition) => [condition.key, with_providers.find((finding) => finding.pertaining_to_key === condition.key)]));
  }
};
export {
  brief_history as b
};
