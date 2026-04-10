import { O as OpenEncounterWorkflowPage, F as object, b3 as record, G as string, b4 as number, b5 as snomed_concept_id, a } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ["TODO: reimplement, maybe"];
const VitalsMeasurementSchema = object({
  findings: record(string().uuid(), object({
    snomed_concept_id,
    value: number().positive().optional(),
    units: string().min(1, "Units are required")
  }).strict()).optional().transform((findings) => Object.entries(findings || {}).map(([finding_id, finding]) => ({
    finding_id,
    ...finding,
    evaluation: null
  })))
}).strict();
const handler$1 = postHandler(
  VitalsMeasurementSchema,
  // deno-lint-ignore require-await
  async (_ctx, _form_values) => {
    throw new Error("TODO: consultation/vitals");
  }
);
async function VitalsMeasurementsPage(_ctx) {
  return a($$_tpl_1);
}
const measurements = OpenEncounterWorkflowPage(VitalsMeasurementsPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_vitals_measurements = measurements;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_vitals_measurements as default,
  handler,
  handlers
};
