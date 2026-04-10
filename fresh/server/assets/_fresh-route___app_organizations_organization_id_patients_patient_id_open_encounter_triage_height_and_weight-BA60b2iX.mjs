import { O as OpenEncounterWorkflowPage, b_ as completedProcedure, Q as compact, cm as entries, bH as VITAL_MEASUREMENTS_SNOMED_CONCEPTS, cn as parseWithSchema, co as measurement_comparator, bz as patient_findings, bu as exists, a1 as completeAndProceedToNextStep, F as object, b3 as record, G as string, c1 as positive_decimal, _ as _enum, c3 as redirectToRoutePatientIfEmergency, bg as assertAllPriorStepsCompleted, u, cp as HeightAndWeight } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { p as patient_vitals } from "./patient_vitals-DClQd8G6.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const TriageHeightAndWeightSchema = object({
  measurements: record(_enum(["height", "weight"]), object({
    value: positive_decimal,
    units: string().min(1)
  }).strict())
}).strict();
const handler$1 = postHandler(TriageHeightAndWeightSchema, async (ctx, form_values) => {
  const {
    trx,
    employment_id,
    patient_id,
    patient_encounter_id,
    patient_encounter_employee_id,
    workflow_step_snomed_concept
  } = ctx.state;
  const completed_procedure = completedProcedure(ctx);
  const measurements_to_insert = compact(entries(form_values.measurements).map(([vital, measurement]) => {
    if (!measurement) return void 0;
    const snomed_concept = VITAL_MEASUREMENTS_SNOMED_CONCEPTS[vital];
    return parseWithSchema(`(= (measurement ${snomed_concept.s_expression} ${measurement.units}) ${measurement.value})`, measurement_comparator);
  }));
  await patient_findings.insertMany(trx, {
    patient_id,
    patient_encounter_id,
    patient_encounter_employee_id,
    employment_id,
    procedure: completed_procedure || {
      create_with_specific_snomed_concept_id: exists(workflow_step_snomed_concept?.id)
    },
    findings: [],
    measurements: measurements_to_insert
  });
  return completeAndProceedToNextStep(ctx);
});
async function TriageHeightAndWeightPage(ctx) {
  redirectToRoutePatientIfEmergency(ctx);
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false
  });
  const most_recent_patient_vitals = await patient_vitals.getMostRecentMeasurements(ctx.state.trx, {
    health_worker_id: ctx.state.health_worker.id,
    patient_id: ctx.state.patient.id,
    snomed_concept_ids: [VITAL_MEASUREMENTS_SNOMED_CONCEPTS.height.id, VITAL_MEASUREMENTS_SNOMED_CONCEPTS.weight.id]
  });
  return u(HeightAndWeight, {
    most_recent_patient_vitals,
    organization_id: ctx.state.organization.id
  });
}
const height_and_weight = OpenEncounterWorkflowPage(TriageHeightAndWeightPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_triage_height_and_weight = height_and_weight;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_triage_height_and_weight as default,
  handler,
  handlers
};
