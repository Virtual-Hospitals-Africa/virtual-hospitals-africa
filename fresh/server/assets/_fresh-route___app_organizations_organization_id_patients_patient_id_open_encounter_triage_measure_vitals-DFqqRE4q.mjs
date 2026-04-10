import { O as OpenEncounterWorkflowPage, m as assert, b_ as completedProcedure, Q as compact, cm as entries, bH as VITAL_MEASUREMENTS_SNOMED_CONCEPTS, cn as parseWithSchema, co as measurement_comparator, cC as getScoreForMeasurement, cD as getScoreForAssessment, bG as VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS, a2 as promiseProps, a1 as completeAndProceedToNextStep, v as assertOr400, bz as patient_findings, bu as exists, cE as inverseSExpression, ag as events, bg as assertAllPriorStepsCompleted, ca as COMMON_CONDITIONS, cF as measureVitalsInputDefinitions, F as object, cG as partialRecord, bY as sExpressionZodValidator, _ as _enum, cH as keys, G as string, c1 as positive_decimal, c3 as redirectToRoutePatientIfEmergency, u, cI as VitalsMeasurementsForm, bZ as insertable_finding_base } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { p as patient_vitals } from "./patient_vitals-DClQd8G6.mjs";
import { b as brief_history } from "./brief_history-DCXrVoy0.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const TriageMeasureVitalsSchema = object({
  measurements: partialRecord(_enum(keys(VITAL_MEASUREMENTS_SNOMED_CONCEPTS)), object({
    value: positive_decimal.optional(),
    units: string().min(1)
  }).strict().transform(({
    value,
    units
  }) => value ? {
    value,
    units
  } : void 0)).default({}),
  assessments: partialRecord(_enum(keys(VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS)), object({
    s_expression: sExpressionZodValidator(insertable_finding_base)
  }).strict()).default({})
}).strict();
async function sharedVitalsDeterminations(ctx) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false
  });
  const {
    trx,
    health_worker,
    patient,
    patient_age_determination,
    encounter
  } = ctx.state;
  assert(patient_age_determination, `Age unknown`);
  const patient_id = patient.id;
  const {
    diabetes
  } = await brief_history.renderedMostRecentRecords(trx, {
    patient_id,
    encounter,
    health_worker_id: health_worker.id,
    conditions: COMMON_CONDITIONS.filter((condition) => condition.key === "diabetes")
  });
  const {
    measurements,
    assessments
  } = measureVitalsInputDefinitions({
    age_determination: patient_age_determination,
    has_diabetes: diabetes?.existence === "Yes"
  });
  return {
    measurements,
    assessments
  };
}
const handler$1 = postHandler(TriageMeasureVitalsSchema, async (ctx, form_values) => {
  const {
    trx,
    health_worker_id,
    employment_id,
    patient_id,
    patient_encounter_id,
    patient_age_determination,
    patient_encounter_employee_id,
    workflow,
    step,
    workflow_step_snomed_concept
  } = ctx.state;
  assert(patient_age_determination, `Age unknown`);
  const completed_procedure = completedProcedure(ctx);
  const measurements_to_insert = compact(entries(form_values.measurements).map(([vital, measurement]) => {
    if (!measurement) return void 0;
    const snomed_concept = VITAL_MEASUREMENTS_SNOMED_CONCEPTS[vital];
    const measurement_comparison = parseWithSchema(`(= (measurement ${snomed_concept.s_expression} ${measurement.units}) ${measurement.value})`, measurement_comparator);
    const score = getScoreForMeasurement(patient_age_determination, vital, measurement_comparison.value);
    return {
      ...measurement_comparison,
      score
    };
  }));
  const assessments_to_insert = compact(entries(form_values.assessments).map(([vital, assessment]) => {
    if (!assessment) return void 0;
    assert(assessment.s_expression);
    const score = getScoreForAssessment(patient_age_determination, vital, assessment.s_expression);
    const evaluation_snomed_concept = VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS[vital];
    return {
      ...assessment.s_expression,
      score: score != null ? {
        value: score,
        evaluation_snomed_concept_id: evaluation_snomed_concept.id
      } : void 0
    };
  }));
  const {
    insert_result,
    response,
    shared: {
      measurements,
      assessments
    },
    previous_measurements_this_encounter,
    previous_assessments_this_encounter
  } = await promiseProps({
    insert_result: insertAll(),
    response: completeAndProceedToNextStep(ctx),
    shared: sharedVitalsDeterminations(ctx),
    previous_measurements_this_encounter: patient_vitals.getMostRecentMeasurements(trx, {
      patient_id,
      patient_encounter_id,
      health_worker_id,
      snomed_concept_ids: Object.values(VITAL_MEASUREMENTS_SNOMED_CONCEPTS).map((concept) => concept.id)
    }),
    previous_assessments_this_encounter: patient_vitals.getMostRecentAssessments(trx, {
      patient_id,
      patient_encounter_id,
      health_worker_id,
      snomed_concept_ids: Object.values(VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS).map((concept) => concept.id)
    })
  });
  function insertAll() {
    if (!measurements_to_insert.length && assessments_to_insert.length) {
      assertOr400(completed_procedure, "Must have assessments/measurements to insert");
      return Promise.resolve({
        success: true,
        procedure_id: completed_procedure.procedure_id,
        finding_ids: [],
        measurement_ids: []
      });
    }
    return patient_findings.insertMany(trx, {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      employment_id,
      procedure: completed_procedure || {
        create_with_specific_snomed_concept_id: exists(workflow_step_snomed_concept?.id)
      },
      findings: assessments_to_insert,
      measurements: measurements_to_insert
    });
  }
  for (const {
    vital,
    units,
    snomed_concept_id
  } of measurements) {
    const form_input = form_values.measurements[vital];
    if (form_input) {
      assertOr400(form_input.units === units, `Expected units to be ${units}. Received ${form_input.units}.`);
      continue;
    }
    const measured_previously = previous_measurements_this_encounter.some((v) => v.specific_snomed_concept_id === snomed_concept_id);
    assertOr400(measured_previously, `Missing required measurement: ${vital}`);
  }
  for (const {
    vital,
    options,
    evaluation_snomed_concept_id
  } of assessments) {
    const form_input = form_values.assessments[vital];
    if (form_input) {
      const option_s_expressions = options.map((o) => o.s_expression);
      const normal_form = inverseSExpression(form_input.s_expression);
      assert(form_input.s_expression);
      assertOr400(option_s_expressions.includes(normal_form), `Expected s_expression to be one of ${option_s_expressions}. Received ${normal_form}.`);
      continue;
    }
    const assessed_previously = previous_assessments_this_encounter.some((finding) => finding.evaluations.some((evaluation) => evaluation.specific_snomed_concept_id === evaluation_snomed_concept_id));
    assertOr400(assessed_previously, `Missing required assessment: ${vital}`);
  }
  await events.insert(trx, {
    type: "ProcedureCompleted",
    data: {
      workflow,
      step,
      patient_id,
      patient_encounter_id,
      patient_age_determination,
      procedure_id: insert_result.procedure_id,
      records: [...insert_result.finding_ids, ...insert_result.measurement_ids].map((id) => ({
        id,
        existence: "Yes"
      }))
    }
  });
  return response;
});
async function TriageMeasureVitalsPage(ctx) {
  if (!ctx.state.encounter.workflows.triage.steps_completed.includes("measure_vitals")) {
    redirectToRoutePatientIfEmergency(ctx);
  }
  const {
    measurements,
    assessments
  } = await sharedVitalsDeterminations(ctx);
  const most_recent_patient_measurements = await patient_vitals.getMostRecentMeasurements(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
    health_worker_id: ctx.state.health_worker.id,
    snomed_concept_ids: measurements.map((m) => m.snomed_concept_id)
  });
  const most_recent_patient_assessments = await patient_vitals.getMostRecentAssessments(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
    health_worker_id: ctx.state.health_worker.id,
    snomed_concept_ids: assessments.map((m) => m.evaluation_snomed_concept_id)
  });
  function notRequiredIfMeasurementAlreadyDoneThisEncounter(def) {
    if (!def.required) return def;
    const already_done_this_encounter = most_recent_patient_measurements.some((v) => v.specific_snomed_concept_id === def.snomed_concept_id && v.patient_encounter_id === ctx.state.encounter.patient_encounter_id);
    return {
      ...def,
      required: !already_done_this_encounter
    };
  }
  function notRequiredIfAssessmentAlreadyDoneThisEncounter(def) {
    if (!def.required) return def;
    const already_done_this_encounter = most_recent_patient_assessments.some((v) => v.evaluations.some((e) => e.specific_snomed_concept_id === def.evaluation_snomed_concept_id) && v.patient_encounter_id === ctx.state.encounter.patient_encounter_id);
    return {
      ...def,
      required: !already_done_this_encounter
    };
  }
  return u(VitalsMeasurementsForm, {
    vital_measurements_for_this_encounter: measurements.map(notRequiredIfMeasurementAlreadyDoneThisEncounter),
    triage_assessments: assessments.map(notRequiredIfAssessmentAlreadyDoneThisEncounter),
    most_recent_patient_vitals: [...most_recent_patient_measurements, ...most_recent_patient_assessments],
    organization_id: ctx.state.organization.id
  });
}
const measure_vitals = OpenEncounterWorkflowPage(TriageMeasureVitalsPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_triage_measure_vitals = measure_vitals;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_triage_measure_vitals as default,
  handler,
  handlers
};
