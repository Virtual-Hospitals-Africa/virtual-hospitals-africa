import { O as OpenEncounterWorkflowPage, a1 as completeAndProceedToNextStep, F as object, b3 as record, G as string, _ as _enum, b5 as snomed_concept_id, b6 as PRIORITIES, a } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ["TODO: reimplement"];
const VitalsEvaluationSchema = object({
  findings: record(string().uuid(), object({
    finding_id: string().uuid(),
    snomed_concept_id,
    priority: _enum(PRIORITIES).optional(),
    note: string().trim().optional()
  })).optional().transform((findings) => Object.entries(findings || {}).map(([_, evaluation_data]) => evaluation_data))
});
const handler$1 = postHandler(
  VitalsEvaluationSchema,
  // deno-lint-ignore require-await
  async (ctx, _form_values) => {
    return completeAndProceedToNextStep(ctx);
  }
);
async function VitalsEvaluationsPage(_ctx) {
  return a($$_tpl_1);
}
const evaluations = OpenEncounterWorkflowPage(VitalsEvaluationsPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_vitals_evaluations = evaluations;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_vitals_evaluations as default,
  handler,
  handlers
};
