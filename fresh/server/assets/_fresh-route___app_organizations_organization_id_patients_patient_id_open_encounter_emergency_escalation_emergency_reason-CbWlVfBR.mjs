import { O as OpenEncounterWorkflowPage, b_ as completedProcedure, a2 as promiseProps, a1 as completeAndProceedToNextStep, c8 as assertOr409, aA as humanReadableJson, bV as NO_QUALIFIER, m as assert, bz as patient_findings, bu as exists, b$ as zip, ag as events, bU as compactMap, c0 as markEnteredInError, bO as now, F as object, a8 as boolean, b3 as record, G as string, c2 as values, bg as assertAllPriorStepsCompleted, u, c9 as WarningSigns, _ as _enum, bY as sExpressionZodValidator, bw as ORDERED_PRIORITIES, bZ as insertable_finding_base, cd as asNormalFormSExpression, ce as normalForm, cf as COMMON_SYMPTOMS } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { g as getWarningSignsForPatient } from "./warning_signs-Gp8Gmaz_.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./brief_history-DCXrVoy0.mjs";
function hrefFromCtx(ctx, callback) {
  const url = new URL(ctx.url);
  callback(url);
  return `${url.pathname}${url.search}${url.hash}` || "/";
}
const EmergencyEscalationEmergencyReasonSchema = object({
  s_expression: sExpressionZodValidator(insertable_finding_base),
  existence: _enum(["Yes", "No"]).optional().transform((existence) => existence || "No"),
  warning_sign_key: string().optional(),
  priority_level: _enum(ORDERED_PRIORITIES).optional(),
  existing_record: object({
    id: string(),
    altered: boolean().optional()
  }).optional()
}).strict();
const EmergencyEscalationReasonsSchema = object({
  warning_signs: record(string(), EmergencyEscalationEmergencyReasonSchema).optional().default({}).transform(values),
  __test_only_skip_inserting_negative_findings: boolean().optional()
}).strict();
const NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges = /* @__PURE__ */ Symbol("NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges");
const handler$1 = postHandler(EmergencyEscalationReasonsSchema, async (ctx, form_values) => {
  const {
    trx,
    workflow,
    step,
    patient_id,
    employment_id,
    patient_encounter_id,
    patient_age_determination,
    patient_encounter_employee_id,
    workflow_step_snomed_concept
  } = ctx.state;
  const completed_procedure = completedProcedure(ctx);
  const {
    response,
    inserted,
    previously_reported
  } = await promiseProps({
    previously_reported: getAllFindingsReportedPreviouslyOnThisPage(ctx),
    inserted: insertSigns(),
    response: completeAndProceedToNextStep(ctx),
    mark_modified_as_invalid: markAlteredRecords()
  });
  for (const previous_finding of previously_reported) {
    const just_submitted = form_values.warning_signs.find((submitted) => submitted.existing_record?.id === previous_finding.id);
    assertOr409(just_submitted, `It is expected that the frontend resubmit previously submitted records. Missing: ${humanReadableJson(previous_finding)}`);
    const client_said_was_altered = !!just_submitted.existing_record?.altered;
    const was_indeed_altered = just_submitted.existence !== previous_finding.existence;
    assertOr409(client_said_was_altered === was_indeed_altered, `It is expected that the frontend keep track of whether the previously submitted record was altered. Detected a mismatch for ${previous_finding.id} which had existence: ${previous_finding.existence}, but just_submitted.existence: ${just_submitted?.existence}`);
  }
  await dispatchEvent(inserted);
  return response;
  async function insertSigns() {
    const needing_insert = form_values.warning_signs.filter((sign) => !sign.existing_record || sign.existing_record.altered).filter((sign) => sign.existence === "Yes" || !form_values.__test_only_skip_inserting_negative_findings);
    const findings_to_insert = needing_insert.map((sign) => ({
      ...sign.s_expression,
      priority: sign.existence === "Yes" && sign.priority_level ? {
        level: sign.priority_level,
        by_system: true
      } : null,
      value_snomed_concept: sign.existence === "Yes" ? null : {
        atom: "snomed_concept",
        ...NO_QUALIFIER
      }
    }));
    if (!findings_to_insert.length) {
      assert(completed_procedure, "Your first time submitting warning signs there must be findings to insert");
      return NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges;
    }
    const {
      success,
      procedure_id,
      finding_ids
    } = await patient_findings.insertMany(trx, {
      patient_id,
      employment_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      findings: findings_to_insert,
      procedure: completed_procedure || {
        create_with_specific_snomed_concept_id: exists(workflow_step_snomed_concept?.id)
      }
    });
    assert(success);
    assert(procedure_id);
    const records = Array.from(zip(finding_ids, needing_insert).map(([id, {
      existence
    }]) => ({
      id,
      existence
    })));
    return {
      records,
      procedure_id
    };
  }
  function dispatchEvent(inserted2) {
    if (inserted2 === NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges) return;
    return events.insert(trx, {
      type: "ProcedureCompleted",
      data: {
        patient_id,
        patient_encounter_id,
        patient_age_determination,
        workflow,
        step,
        ...inserted2
      }
    });
  }
  function markAlteredRecords() {
    if (!completed_procedure) {
      for (const sign of form_values.warning_signs) {
        assertOr409(!sign.existing_record?.altered, "With no previously completed procedure, there cannot be record alterations");
      }
      return;
    }
    const altered_record_ids = compactMap(form_values.warning_signs, (sign) => sign.existing_record?.altered && sign.existing_record.id);
    return markEnteredInError(trx, {
      patient_id,
      employment_id,
      patient_encounter_id,
      altered_record_ids,
      ...completed_procedure
    });
  }
});
function getAllFindingsReportedPreviouslyOnThisPage(ctx) {
  const {
    trx,
    patient_id,
    patient_encounter_id
  } = ctx.state;
  const completed_procedure = completedProcedure(ctx);
  if (!completed_procedure) return Promise.resolve([]);
  return patient_findings.findAll(trx, {
    patient_id,
    patient_encounter_id,
    ...completed_procedure,
    include_negative: true,
    before: now
  });
}
function* signsMatchedWithPriorRecords(prior_findings, warning_signs_for_patient, common_symptoms) {
  const findings_set = new Set(prior_findings.map((finding) => {
    const normal_form_s_expression = asNormalFormSExpression({
      ...finding,
      value: null
    });
    const existing_record = {
      id: finding.id,
      existence: finding.existence
    };
    return {
      ...finding,
      normal_form_s_expression,
      existing_record
    };
  }));
  const warning_signs_and_common_symptoms = [...warning_signs_for_patient, ...common_symptoms];
  for (const sign of warning_signs_and_common_symptoms) {
    let existing_record;
    for (const finding of findings_set) {
      assert(sign.clinical_finding_s_expression === normalForm(sign.clinical_finding_s_expression), "Comparing concepts requires they be in normal form");
      const is_same_concept = finding.normal_form_s_expression === sign.clinical_finding_s_expression;
      if (is_same_concept) {
        existing_record = finding.existing_record;
        findings_set.delete(finding);
        break;
      }
    }
    yield {
      ...sign,
      existing_record
    };
  }
  for (const finding of findings_set) {
    yield {
      priority: finding.priority,
      clinical_finding_s_expression: finding.normal_form_s_expression,
      name: finding.specific_snomed_concept_name,
      description: finding.specific_snomed_concept_category,
      existing_record: finding.existing_record,
      category: "Prior record"
    };
  }
}
async function EmergencyEscalationReasonPage(ctx) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false
  });
  const {
    prior_findings,
    warning_signs_for_patient
  } = await promiseProps({
    prior_findings: getAllFindingsReportedPreviouslyOnThisPage(ctx),
    warning_signs_for_patient: getWarningSignsForPatient(ctx.state.trx, ctx.state.patient_id, ctx.state.patient_age_determination)
  });
  const warning_signs = signsMatchedWithPriorRecords(prior_findings, warning_signs_for_patient, COMMON_SYMPTOMS);
  return u(WarningSigns, {
    search_route: hrefFromCtx(ctx, (url) => {
      url.pathname = url.pathname.replace("/emergency_escalation/emergency_reason", "/snomed-warning-signs");
    }),
    warning_signs: Array.from(warning_signs)
  });
}
const emergency_reason = OpenEncounterWorkflowPage(EmergencyEscalationReasonPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_emergency_escalation_emergency_reason = emergency_reason;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_emergency_escalation_emergency_reason as default,
  handler,
  handlers
};
