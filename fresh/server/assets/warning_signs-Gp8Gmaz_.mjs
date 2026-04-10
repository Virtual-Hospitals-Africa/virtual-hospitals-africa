import { O as OpenEncounterWorkflowPage, b_ as completedProcedure, a2 as promiseProps, a1 as completeAndProceedToNextStep, c8 as assertOr409, aA as humanReadableJson, bV as NO_QUALIFIER, m as assert, bz as patient_findings, bu as exists, b$ as zip, ag as events, bU as compactMap, c0 as markEnteredInError, bO as now, F as object, a8 as boolean, b3 as record, G as string, c2 as values, u, c9 as WarningSigns, _ as _enum, bY as sExpressionZodValidator, bw as ORDERED_PRIORITIES, bZ as insertable_finding_base, ca as COMMON_CONDITIONS, bk as partition, cb as WARNING_SIGNS, cc as filter, bJ as sortBy, cd as asNormalFormSExpression, ce as normalForm, cf as COMMON_SYMPTOMS, cg as satisfyingSExpression } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { b as brief_history } from "./brief_history-DCXrVoy0.mjs";
function subsets(array) {
  return array.reduce((acc, item) => [...acc, ...acc.map((subset) => [...subset, item])], [[]]);
}
const TriageWarningSignSchema = object({
  s_expression: sExpressionZodValidator(insertable_finding_base),
  existence: _enum(["Yes", "No"]).optional().transform((existence) => existence || "No"),
  warning_sign_key: string().optional(),
  priority_level: _enum(ORDERED_PRIORITIES).optional(),
  existing_record: object({
    id: string(),
    altered: boolean().optional()
  }).optional()
}).strict();
const TriageWarningSignsSchema = object({
  warning_signs: record(string(), TriageWarningSignSchema).optional().default({}).transform(values),
  __test_only_skip_inserting_negative_findings: boolean().optional()
}).strict();
const NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges = /* @__PURE__ */ Symbol("NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges");
const handler = postHandler(TriageWarningSignsSchema, async (ctx, form_values) => {
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
        workflow,
        step,
        patient_id,
        patient_encounter_id,
        patient_age_determination,
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
async function getWarningSignsForPatient(trx, patient_id, patient_age_determination = null) {
  const signs = WARNING_SIGNS[patient_age_determination || "adult"];
  const [having_prompt_when, no_prompt_when] = partition(signs, (sign) => !!sign.prompt_when_s_expression || !!sign.prompt_when_not_s_expression);
  const satisfying_prompt_when = await filter(having_prompt_when, promptWhen);
  const warning_signs_for_patient = [...no_prompt_when, ...satisfying_prompt_when];
  return sortBy(warning_signs_for_patient, (sign) => ORDERED_PRIORITIES.indexOf(sign.priority), (sign) => signs.indexOf(sign));
  async function promptWhen({
    prompt_when_s_expression,
    prompt_when_not_s_expression
  }) {
    assert(Number(!!prompt_when_s_expression) + Number(!!prompt_when_not_s_expression) === 1);
    const {
      satisfies
    } = await satisfyingSExpression(trx, {
      patient_id,
      s_expression: prompt_when_s_expression || prompt_when_not_s_expression
    });
    return prompt_when_s_expression ? satisfies : !satisfies;
  }
}
function* signsMatchedWithPriorRecords(prior_findings, warning_signs_for_patient, common_symptoms) {
  const prior_findings_remaining = new Set(prior_findings);
  const prior_findings_map = /* @__PURE__ */ new Map();
  for (const prior_finding of prior_findings) {
    for (const modifier_subset of subsets(prior_finding.modifiers)) {
      for (const attribute_subset of subsets(prior_finding.attributes)) {
        const normal_form_s_expression = asNormalFormSExpression({
          ...prior_finding,
          modifiers: modifier_subset,
          attributes: attribute_subset,
          existence: "Yes",
          value: null
        });
        prior_findings_map.set(normal_form_s_expression, prior_finding);
      }
    }
  }
  const warning_signs_and_common_symptoms = [...warning_signs_for_patient, ...common_symptoms];
  for (const sign of warning_signs_and_common_symptoms) {
    let existing_record;
    const normalized_sign_s_expression = normalForm(sign.clinical_finding_s_expression);
    const matching_prior_finding = prior_findings_map.get(normalized_sign_s_expression);
    if (matching_prior_finding) {
      existing_record = {
        id: matching_prior_finding.id,
        existence: matching_prior_finding.existence
      };
      if (matching_prior_finding.existence === "Yes") {
        const canonical_normal_form = asNormalFormSExpression({
          ...matching_prior_finding,
          value: null
        });
        if (canonical_normal_form !== normalized_sign_s_expression) {
          existing_record.augmented = {
            s_expression: canonical_normal_form,
            full_display: matching_prior_finding.displays.full
          };
        }
      }
      prior_findings_remaining.delete(matching_prior_finding);
    }
    yield {
      ...sign,
      existing_record
    };
  }
  for (const finding of prior_findings_remaining) {
    yield {
      priority: finding.priority,
      clinical_finding_s_expression: asNormalFormSExpression({
        ...finding,
        value: null
      }),
      name: finding.specific_snomed_concept_name,
      description: finding.specific_snomed_concept_category,
      existing_record: {
        id: finding.id,
        existence: finding.existence
      },
      category: "Prior record"
    };
  }
}
function getBriefHistory({
  state: {
    trx,
    patient_id,
    encounter,
    health_worker_id
  }
}) {
  return brief_history.renderedMostRecentRecords(trx, {
    patient_id,
    encounter,
    health_worker_id,
    conditions: COMMON_CONDITIONS.filter((condition) => condition.key === "pregnancy")
  });
}
async function TriageWarningSignsPage(ctx) {
  const {
    prior_findings,
    warning_signs_for_patient,
    brief_history: brief_history2
  } = await promiseProps({
    prior_findings: getAllFindingsReportedPreviouslyOnThisPage(ctx),
    warning_signs_for_patient: getWarningSignsForPatient(ctx.state.trx, ctx.state.patient_id, ctx.state.patient_age_determination),
    brief_history: getBriefHistory(ctx)
  });
  const warning_signs2 = signsMatchedWithPriorRecords(prior_findings, warning_signs_for_patient, COMMON_SYMPTOMS);
  const warning_signs_search_params = new URLSearchParams();
  warning_signs_search_params.set("age_determination", exists(ctx.state.patient_age_determination));
  if (brief_history2.pregnancy?.existence === "Yes") {
    warning_signs_search_params.set("pregnancy", "true");
  }
  return u(WarningSigns, {
    search_route: `/app/snomed/warning-signs?${warning_signs_search_params}`,
    warning_signs: Array.from(warning_signs2)
  });
}
const warning_signs = OpenEncounterWorkflowPage(TriageWarningSignsPage);
export {
  getWarningSignsForPatient as g,
  handler as h,
  warning_signs as w
};
