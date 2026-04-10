import { aU as base, d_ as asConceptSExpression } from "../server-entry.mjs";
import { s as snomed_concept_finding_like } from "./snomed_concept_finding_like-B7ohdfHf.mjs";
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
const snomed_warning_signs = base({
  top_level_table: "snomed_concept_finding_like",
  baseQuery(trx, {
    age_determination,
    pregnancy,
    ...terms
  }) {
    return trx.selectFrom(snomed_concept_finding_like.baseQuery(trx, terms).as("results")).leftJoin("snomed_concept_prioritizations", (join) => join.onRef("snomed_concept_prioritizations.id", "=", "results.id").on("snomed_concept_prioritizations.age_determination", "=", age_determination).on("snomed_concept_prioritizations.pregnancy", "=", !!pregnancy)).selectAll("results").select(["snomed_concept_prioritizations.priority", "snomed_concept_prioritizations.warning_sign as priority_by_virtue_of_matching_warning_sign"]);
  },
  formatResult({
    id: snomed_concept_id,
    ...result
  }) {
    const concept_s_expression = asConceptSExpression(result);
    const clinical_finding_s_expression = `(clinical_finding ${concept_s_expression})`;
    return {
      ...result,
      clinical_finding_s_expression,
      snomed_concept_id,
      category: "Search Results",
      description: result.category
    };
  }
});
const handler$1 = jsonSearchHandler(snomed_warning_signs);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_snomed_warning_signs = void 0;
export {
  config,
  css,
  _freshRoute___app_snomed_warning_signs as default,
  handler,
  handlers
};
