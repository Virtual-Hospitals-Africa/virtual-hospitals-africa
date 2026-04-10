import { O as OpenEncounterWorkflowPage, a1 as completeAndProceedToNextStep, F as object, bg as assertAllPriorStepsCompleted, bu as exists, a2 as promiseProps, bv as diagnoses, S as assertEquals, m as assert, bw as ORDERED_PRIORITIES, bk as partition, u, bx as TriageAssignPriorityTable, bn as additional_tasks, by as logReadableJson, $ as assertOrRedirect, bz as patient_findings, bA as patient_procedures, bB as WORKFLOW_STEP_SNOMED_CONCEPTS, bC as patient_record_providers, U as completedPersonal, bD as patientAgeDetermination, bE as patient_evaluation_scores, bF as triageLevelFromTEWSTotal, bG as VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS, bH as VITAL_MEASUREMENTS_SNOMED_CONCEPTS, bI as buildReferenceRanges, Q as compact, bJ as sortBy, bK as vitalAssessmentOrder, bL as MEASUREMENTS_ORDERED, bM as vitalMeasurementFromSnomedConceptId } from "../server-entry.mjs";
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
function intersection(arr1, arr2) {
  return arr1.filter((item) => arr2.includes(item));
}
function sumBy(arr, iteratee) {
  const getter = typeof iteratee === "function" ? iteratee : (obj) => obj[iteratee];
  let sum = 0;
  for (const item of arr) {
    sum += getter(item);
  }
  return sum;
}
const TriageAssignPrioritySchema = object({});
const handler$1 = postHandler(
  TriageAssignPrioritySchema,
  // deno-lint-ignore require-await
  async (ctx, _form_values) => {
    return completeAndProceedToNextStep(ctx);
  }
);
async function findingsFromWarningSignsOrAdditionalTasksAndInvestigations({
  state: {
    trx,
    encounter,
    patient_id,
    patient_encounter_id,
    health_worker_id
  }
}) {
  const findings = await patient_findings.findAll(trx, {
    patient_id,
    patient_encounter_id,
    procedure_id: patient_procedures.distinctIds(trx, {
      patient_id,
      patient_encounter_id,
      specific_snomed_concept_id: [WORKFLOW_STEP_SNOMED_CONCEPTS.triage.warning_signs.id, WORKFLOW_STEP_SNOMED_CONCEPTS.triage.additional_tasks_and_investigations.id]
    })
  });
  return patient_record_providers.hydrateIntermediateRecords(trx, {
    records: findings,
    health_worker_id,
    encounter
  });
}
async function totalScore({
  state: {
    trx,
    patient,
    patient_id,
    patient_encounter_id
  }
}) {
  assert(completedPersonal(patient));
  const age_determination = patientAgeDetermination(patient);
  const {
    score
  } = await patient_evaluation_scores.findFirst(trx, {
    patient_id,
    patient_encounter_id,
    s_expression: "(evaluation (evaluates (procedure)))"
  });
  return {
    score,
    priority: triageLevelFromTEWSTotal(score, age_determination)
  };
}
async function sortedVitals({
  state: {
    trx,
    organization_id,
    patient,
    patient_id,
    patient_encounter_id,
    health_worker_id
  }
}) {
  assert(completedPersonal(patient));
  const age_determination = patientAgeDetermination(patient);
  const this_encounter_vitals = await patient_vitals.getMostRecent(trx, {
    health_worker_id,
    patient_id,
    patient_encounter_id,
    measurement_snomed_concept_ids: Object.values(VITAL_MEASUREMENTS_SNOMED_CONCEPTS).map((concept) => concept.id),
    assessment_snomed_concept_ids: Object.values(VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS).map((concept) => concept.id)
  });
  const previous_vitals = await patient_vitals.getMostRecent(trx, {
    health_worker_id,
    patient_id,
    excluding_patient_encounter_id: patient_encounter_id,
    measurement_snomed_concept_ids: this_encounter_vitals.measurements.map((v) => v.specific_snomed_concept_id),
    assessment_snomed_concept_ids: this_encounter_vitals.assessments.flatMap((v) => v.evaluations.map((e) => e.root_snomed_concept_id))
  });
  const measurements_unsorted_with_reference_ranges = this_encounter_vitals.measurements.map((finding) => {
    const previous = previous_vitals.measurements.find((m) => m.specific_snomed_concept_id === finding.specific_snomed_concept_id) ?? null;
    return {
      finding,
      previous,
      type: "measurement",
      reference_ranges: buildReferenceRanges(finding.specific_snomed_concept_id, age_determination, compact([finding.value.value, previous?.value.value]))
    };
  });
  const assessments_sorted = sortBy(this_encounter_vitals.assessments, (a) => -exists(a.score), vitalAssessmentOrder).map((finding) => {
    const evaluation_snomed_concept_ids = intersection(finding.evaluations.map((e) => e.root_snomed_concept_id), Object.values(VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS).map((concept) => concept.id));
    const previous = previous_vitals.assessments.find((a) => {
      a.evaluations.some((e) => evaluation_snomed_concept_ids.includes(e.root_snomed_concept_id));
    }) ?? null;
    return {
      finding,
      previous,
      type: "assessment"
    };
  });
  const [tews_measurements_unsorted, other_measurements_unsorted] = partition(measurements_unsorted_with_reference_ranges, (m) => m.finding.score != null);
  const tews_measurements = sortBy(tews_measurements_unsorted, (m) => MEASUREMENTS_ORDERED.indexOf(vitalMeasurementFromSnomedConceptId(m.finding.specific_snomed_concept_id)));
  const other_measurements = sortBy(other_measurements_unsorted, (m) => m.finding.specific_snomed_concept_id === VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_pressure_diastolic.id ? 0 : 1, (m) => m.finding.created_at, (m) => m.finding.displays.finding);
  return [...assessments_sorted, ...tews_measurements, ...other_measurements].map((row) => ({
    ...row,
    organization_id
  }));
}
async function redirectIfIncompleteNonManageTasks(ctx) {
  const {
    trx,
    health_worker_id,
    encounter,
    open_encounter_pathname
  } = ctx.state;
  const {
    task_groups
  } = await additional_tasks.getTasksGroups(trx, {
    health_worker_id,
    encounter
  });
  logReadableJson(task_groups);
  const some_non_manage_task_incomplete = task_groups.some((task_group) => !task_group.completed && task_group.tasks.some((task) => task.atom === "finding" || task.atom === "measurement"));
  assertOrRedirect(!some_non_manage_task_incomplete, `${open_encounter_pathname}/triage/additional_tasks_and_investigations`);
}
async function TriageAssignPriorityPage(ctx) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false
  });
  const {
    trx,
    encounter,
    organization_id,
    health_worker_id
  } = ctx.state;
  const priority = exists(encounter.priority).name;
  const {
    vitals,
    total_score,
    this_visit_diagnoses,
    with_triage_level_findings
  } = await promiseProps({
    vitals: sortedVitals(ctx),
    total_score: totalScore(ctx),
    this_visit_diagnoses: diagnoses.get(trx, {
      encounter,
      health_worker_id
    }).then((diagnoses2) => diagnoses2.map((diagnosis) => ({
      type: "chief complaint/warning sign",
      previous: null,
      finding: diagnosis,
      organization_id
    }))),
    with_triage_level_findings: findingsFromWarningSignsOrAdditionalTasksAndInvestigations(ctx).then((findings) => findings.map((finding) => ({
      type: "chief complaint/warning sign",
      previous: null,
      finding,
      organization_id
    }))),
    redirect_if_incomplete_non_manage_tasks: redirectIfIncompleteNonManageTasks(ctx)
  });
  assertEquals(total_score.score, sumBy(vitals, (vital) => "score" in vital.finding && vital.finding.score || 0));
  assert(ORDERED_PRIORITIES.indexOf(priority) <= ORDERED_PRIORITIES.indexOf(total_score.priority));
  const [warning_signs, additional_tasks2] = partition(with_triage_level_findings, ({
    finding
  }) => finding.as_part_of_procedure.workflow_step_name === "warning_signs");
  const rows = [...this_visit_diagnoses, ...warning_signs, ...vitals, ...additional_tasks2];
  return u(TriageAssignPriorityTable, {
    rows,
    priority,
    total_score: total_score.score
  });
}
const assign_priority = OpenEncounterWorkflowPage(TriageAssignPriorityPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_triage_assign_priority = assign_priority;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_triage_assign_priority as default,
  handler,
  handlers
};
