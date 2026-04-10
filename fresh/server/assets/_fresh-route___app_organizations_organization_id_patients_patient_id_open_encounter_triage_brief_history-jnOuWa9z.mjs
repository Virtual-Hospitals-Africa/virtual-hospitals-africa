import { aU as base, cq as assertUnreachable, bQ as formatRecord, bz as patient_findings, aI as sql, cr as patient_evaluations, bA as patient_procedures, O as OpenEncounterWorkflowPage, b_ as completedProcedure, cm as entries, cl as commonConditionSnomedConcept, cn as parseWithSchema, bZ as insertable_finding_base, a2 as promiseProps, a1 as completeAndProceedToNextStep, ag as events, b$ as zip, v as assertOr400, bu as exists, c0 as markEnteredInError, ca as COMMON_CONDITIONS, cs as STATUS_ATTRIBUTE, ct as SELF_REPORTED_QUALIFIER, F as object, c3 as redirectToRoutePatientIfEmergency, bg as assertAllPriorStepsCompleted, m as assert, U as completedPersonal, u, cu as BriefHistorySection, cv as snomed_category, G as string, b5 as snomed_concept_id, bC as patient_record_providers, bX as yes_no_unknown } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { b as brief_history$1 } from "./brief_history-DCXrVoy0.mjs";
import { s as snomed_concept_finding_like } from "./snomed_concept_finding_like-B7ohdfHf.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const patient_records_any_top_level = base({
  top_level_table: "patient_records_aggregated",
  baseQuery(trx, opts) {
    const findings = trx.selectFrom(patient_findings.baseQuery(trx, opts).as("r")).select(["r.id", sql`row_to_json(r)`.as("record")]);
    const evaluations = trx.selectFrom(patient_evaluations.baseQuery(trx, opts).as("r")).select(["r.id", sql`row_to_json(r)`.as("record")]);
    const procedures = trx.selectFrom(patient_procedures.baseQuery(trx, opts).as("r")).select(["r.id", sql`row_to_json(r)`.as("record")]);
    return findings.unionAll(evaluations).unionAll(procedures);
  },
  formatResult({
    record
  }) {
    switch (record.type) {
      case "finding":
        return formatRecord(record);
      case "evaluation":
        return formatRecord(record);
      case "procedure":
        return formatRecord(record);
      default:
        assertUnreachable(record);
    }
  }
});
const ConditionSchemaOptional = object({
  existence: yes_no_unknown.optional()
}).optional();
const ConditionSchemaRequired = object({
  existence: yes_no_unknown
});
const AllergiesSchema = object({
  id: snomed_concept_id,
  name: string(),
  category: snomed_category
}).array();
const CommonConditionSchema = object({
  diabetes: ConditionSchemaRequired,
  pregnancy: ConditionSchemaRequired,
  tuberculosis: ConditionSchemaOptional,
  hiv: ConditionSchemaOptional,
  asthma: ConditionSchemaOptional,
  copd: ConditionSchemaOptional,
  heart_disease: ConditionSchemaOptional,
  mental_disorder: ConditionSchemaOptional,
  epilepsy: ConditionSchemaOptional,
  arthritis: ConditionSchemaOptional,
  cancer: ConditionSchemaOptional
});
const TriageBriefHistorySchema = object({
  common_conditions: CommonConditionSchema,
  additional_chronic_conditions: AllergiesSchema.optional(),
  allergies: AllergiesSchema.optional()
});
function mostRecentRecords({
  state
}) {
  const {
    trx,
    encounter,
    patient_id,
    health_worker_id
  } = state;
  return brief_history$1.renderedMostRecentRecords(trx, {
    encounter,
    patient_id,
    health_worker_id,
    conditions: COMMON_CONDITIONS
  });
}
function additionalChronicConditions({
  state
}) {
  const {
    trx,
    encounter,
    patient_id,
    health_worker_id
  } = state;
  return patient_records_any_top_level.findAll(trx, {
    patient_id,
    specific_snomed_concept_id: snomed_concept_finding_like.distinctIds(trx, {
      chronic: true
    })
  }).then((records) => patient_record_providers.hydrateIntermediateRecords(trx, {
    records,
    encounter,
    health_worker_id
  }));
}
function existingAllergies({
  state
}) {
  const {
    trx,
    encounter,
    patient_id,
    health_worker_id
  } = state;
  return patient_findings.findAll(trx, {
    patient_id,
    s_expression: "(allergy)"
  }).then((records) => patient_record_providers.hydrateIntermediateRecords(trx, {
    records,
    encounter,
    health_worker_id
  }));
}
function selfReportedStatusSExpression(condition_snomed_concept, existence) {
  return parseWithSchema(`
    (finding 
      ${STATUS_ATTRIBUTE.s_expression}
      ${condition_snomed_concept.s_expression}
      ${patient_findings.QUALIFIERS_BY_EXISTENCE[existence].s_expression}
      (qualifier ${SELF_REPORTED_QUALIFIER.s_expression}))
  `, insertable_finding_base);
}
const handler$1 = postHandler(TriageBriefHistorySchema, async (ctx, form_values) => {
  const {
    trx,
    patient_id,
    patient_encounter_id,
    patient_encounter_employee_id,
    employment_id,
    workflow,
    workflow_step_snomed_concept,
    step,
    patient_age_determination
  } = ctx.state;
  const completed_procedure = completedProcedure(ctx);
  const most_recent_findings = await mostRecentRecords(ctx);
  const findings_to_insert = [];
  const altered_records = [];
  for (const [condition_key, condition] of entries(form_values.common_conditions)) {
    if (condition?.existence === void 0) continue;
    const condition_snomed_concept = commonConditionSnomedConcept(condition_key);
    const prior_matching_finding = most_recent_findings[condition_key];
    if (prior_matching_finding?.existence === "Yes" && condition.existence === "Yes") {
      continue;
    }
    if (prior_matching_finding?.patient_encounter_id === patient_encounter_id) {
      altered_records.push({
        record_id: prior_matching_finding.id,
        condition_key
      });
    }
    findings_to_insert.push(selfReportedStatusSExpression(condition_snomed_concept, condition.existence));
  }
  for (const condition of form_values.additional_chronic_conditions || []) {
    findings_to_insert.push(selfReportedStatusSExpression({
      s_expression: `(snomed_concept "${condition.name}" "${condition.category}")`
    }, "Yes"));
  }
  for (const allergy of form_values.allergies || []) {
    findings_to_insert.push(parseWithSchema(`(clinical_finding (snomed_concept "${allergy.name}" "${allergy.category}"))`, insertable_finding_base));
  }
  const {
    response,
    insert_result
  } = await promiseProps({
    response: completeAndProceedToNextStep(ctx),
    insert_result: insertFindings(),
    _mark_altered: markAlteredRecords()
  });
  if (insert_result) {
    await events.insert(trx, {
      type: "ProcedureCompleted",
      data: {
        workflow,
        step,
        patient_id,
        patient_encounter_id,
        patient_age_determination,
        procedure_id: insert_result.procedure_id,
        records: zip(insert_result.finding_ids, findings_to_insert).map(([id, finding]) => ({
          id,
          existence: finding.existence
        })).toArray()
      }
    });
  }
  return response;
  function insertFindings() {
    if (!findings_to_insert.length) {
      assertOr400(completed_procedure, "Your first time submitting brief history there must be findings to insert");
      return Promise.resolve();
    }
    return patient_findings.insertMany(trx, {
      patient_id,
      employment_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      findings: findings_to_insert,
      procedure: completed_procedure || {
        create_with_specific_snomed_concept_id: exists(workflow_step_snomed_concept?.id)
      }
    });
  }
  function markAlteredRecords() {
    if (!completed_procedure) {
      assertOr400(!altered_records.length, `With no previously completed procedure, there cannot be record alterations, but there was for ${altered_records[0]?.condition_key}`);
      return;
    }
    return markEnteredInError(trx, {
      patient_id,
      employment_id,
      patient_encounter_id,
      altered_record_ids: altered_records.map((record) => record.record_id),
      ...completed_procedure
    });
  }
});
async function TriageBriefHistoryPage(ctx) {
  redirectToRoutePatientIfEmergency(ctx);
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false
  });
  const {
    organization_employment,
    patient
  } = ctx.state;
  assert(completedPersonal(patient));
  const {
    most_recent_findings,
    additional_chronic_conditions,
    existing_allergies
  } = await promiseProps({
    most_recent_findings: mostRecentRecords(ctx),
    additional_chronic_conditions: additionalChronicConditions(ctx),
    existing_allergies: existingAllergies(ctx)
  });
  return u(BriefHistorySection, {
    most_recent_findings,
    additional_chronic_conditions,
    existing_allergies,
    sex: patient.sex,
    organization_id: organization_employment.id
  });
}
const brief_history = OpenEncounterWorkflowPage(TriageBriefHistoryPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_triage_brief_history = brief_history;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_triage_brief_history as default,
  handler,
  handlers
};
