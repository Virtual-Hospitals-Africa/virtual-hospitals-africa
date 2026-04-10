import { z, bU as compactMap, bV as NO_QUALIFIER, bW as UNKNOWN_QUALIFIER, bX as yes_no_unknown, bY as sExpressionZodValidator, bZ as insertable_finding_base, O as OpenEncounterWorkflowPage, m as assert, b_ as completedProcedure, a2 as promiseProps, bn as additional_tasks, a1 as completeAndProceedToNextStep, bz as patient_findings, bu as exists, b$ as zip, ag as events, c0 as markEnteredInError, F as object, b3 as record, G as string, c1 as positive_decimal, c2 as values, c3 as redirectToRoutePatientIfEmergency, bg as assertAllPriorStepsCompleted, c4 as getCookies, u, c5 as AdditionalTasks, c6 as measurement, c7 as to_be_done } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const CheckForSchema = z.object({
  s_expression: sExpressionZodValidator(insertable_finding_base),
  existence: yes_no_unknown,
  existing_record: z.object({
    id: z.string().uuid(),
    existence: yes_no_unknown
  }).nullish()
});
const check_for = {
  Schema: CheckForSchema,
  asInsertableFindings(check_for2) {
    return compactMap(check_for2, (finding) => {
      if (finding.existing_record && finding.existing_record.existence === finding.existence) return;
      return {
        ...finding.s_expression,
        existence: finding.existence,
        value_snomed_concept: finding.existence === "Yes" ? null : finding.existence === "No" ? {
          atom: "snomed_concept",
          ...NO_QUALIFIER
        } : {
          atom: "snomed_concept",
          ...UNKNOWN_QUALIFIER
        }
      };
    });
  },
  isCheckFor(task_to_be_done) {
    return task_to_be_done.atom === "finding";
  }
};
const TriageAdditionalTasksAndInvestigationsSchema = object({
  evaluation_ids: string().uuid().array().optional().default([]),
  just_do_it_tasks: record(string(), object({
    s_expression: sExpressionZodValidator(to_be_done)
  })).optional().default({}).transform(values),
  check_for: record(string(), CheckForSchema).optional().default({}).transform(values),
  measurements: record(string(), object({
    s_expression: sExpressionZodValidator(measurement),
    value: positive_decimal,
    units: string().min(1),
    existing_record: object({
      id: string().uuid(),
      value: positive_decimal
    }).optional()
  })).optional().default({}).transform(values)
});
const NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges = /* @__PURE__ */ Symbol("NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges");
const handler$1 = postHandler(TriageAdditionalTasksAndInvestigationsSchema, async (ctx, form_values) => {
  const {
    trx,
    health_worker_id,
    encounter,
    employment_id,
    workflow,
    step,
    patient_age_determination,
    patient_id,
    patient_encounter_id,
    patient_encounter_employee_id,
    workflow_step_snomed_concept
  } = ctx.state;
  console.log({
    form_values
  });
  assert(patient_age_determination);
  const completed_procedure = completedProcedure(ctx);
  const {
    response,
    inserted
  } = await promiseProps({
    response: completeAndProceedToNextStep(ctx),
    task_groups: additional_tasks.getTasksGroups(trx, {
      health_worker_id,
      encounter
    }),
    inserted: markAlteredRecords().then(() => insertFindings())
  });
  await promiseProps({
    _: inserted === NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges ? Promise.resolve() : additional_tasks.procedureCompletedTasks(trx, {
      patient_id,
      patient_encounter_id,
      procedure_id: inserted.procedure_id,
      evaluation_ids: form_values.evaluation_ids
    }),
    dispatched: dispatchEvent(inserted)
  });
  return response;
  async function insertFindings() {
    const findings_to_insert = check_for.asInsertableFindings(form_values.check_for);
    const measurements_to_insert = compactMap(form_values.measurements, (measurement2) => {
      if (measurement2.existing_record && measurement2.existing_record.value.equals(measurement2.value)) return;
      return {
        atom: "=",
        type: "measurement",
        measurement: measurement2.s_expression,
        value: measurement2.value
      };
    });
    if (!findings_to_insert.length && !measurements_to_insert.length) {
      return NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges;
    }
    const {
      success,
      procedure_id,
      finding_ids,
      measurement_ids
    } = await patient_findings.insertMany(trx, {
      patient_id,
      employment_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      findings: findings_to_insert,
      measurements: measurements_to_insert,
      procedure: completed_procedure || {
        create_with_specific_snomed_concept_id: exists(workflow_step_snomed_concept?.id)
      }
    });
    assert(success);
    assert(procedure_id);
    const finding_records = Array.from(zip(finding_ids, findings_to_insert).map(([id, {
      existence
    }]) => ({
      id,
      existence
    })));
    const measurement_records = measurement_ids.map((id) => ({
      id,
      existence: "Yes"
    }));
    return {
      procedure_id,
      records: [...finding_records, ...measurement_records]
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
    if (!completed_procedure) return Promise.resolve();
    const altered_record_ids = compactMap(form_values.check_for, ({
      existence,
      existing_record
    }) => existing_record && existing_record.existence != existence && existing_record.id);
    return markEnteredInError(trx, {
      patient_id,
      employment_id,
      patient_encounter_id,
      altered_record_ids,
      procedure_id: completed_procedure.procedure_id
    });
  }
});
async function TriageAdditionalTasksAndInvestigationsPage(ctx) {
  redirectToRoutePatientIfEmergency(ctx);
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false
  });
  const {
    trx,
    encounter,
    health_worker_id,
    organization_id
  } = ctx.state;
  const {
    evaluation_ids,
    task_groups
  } = await additional_tasks.getTasksGroups(trx, {
    health_worker_id,
    encounter
  });
  const use_pdf_viewer = getCookies(ctx.req.headers)["twa"] === "1";
  return u(AdditionalTasks, {
    organization_id,
    evaluation_ids,
    task_groups,
    use_pdf_viewer
  });
}
const additional_tasks_and_investigations = OpenEncounterWorkflowPage(TriageAdditionalTasksAndInvestigationsPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_triage_additional_tasks_and_investigations = additional_tasks_and_investigations;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_triage_additional_tasks_and_investigations as default,
  handler,
  handlers
};
