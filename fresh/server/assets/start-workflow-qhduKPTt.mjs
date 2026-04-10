import { r as redirect, Z as canPerform, aN as assertOr403, aR as WORKFLOW_DEPARTMENTS, v as assertOr400, V as patient_workflows, aS as WORKFLOW_STEPS, aT as arrayIsEmpty, m as assert, F as object, _ as _enum } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { p as patient_presence } from "./patient_presence-BDsaizBc.mjs";
const StartWorkflowSchema = object({
  workflow: _enum(["registration", "triage", "consultation", "maternity", "prescription_refill", "doctor_review"])
});
async function startWorkflow(ctx, workflow, opts) {
  const {
    trx,
    organization_employment,
    encounter,
    open_encounter_pathname
  } = ctx.state;
  const department_handling_workflow = canPerform(organization_employment, workflow);
  assertOr403(department_handling_workflow, `You must be employed in the ${WORKFLOW_DEPARTMENTS[workflow].join(" or ")} department to start ${workflow}`);
  const workflow_status = await createOrUseExistingWorkflow();
  assertOr400(workflow_status.status !== "completed", `${workflow} workflow already completed`);
  await Promise.all([doStartWorkflow(), maybeMovePatientIntoWorkflow()]);
  return `${open_encounter_pathname}/${workflow}/${stepToRouteTo()}`;
  async function createOrUseExistingWorkflow() {
    const do_create_workflow = !encounter.workflows[workflow] || opts.planning === "create_anew_every_time";
    const created_workflow = do_create_workflow && await patient_workflows.insertOne(trx, {
      workflow,
      patient_encounter_id: ctx.state.patient_encounter_id
    });
    if (created_workflow) {
      return {
        patient_workflow_id: created_workflow.id,
        workflow,
        status: "not started",
        steps_completed: [],
        seen_patient_encounter_employee_ids: []
      };
    }
    assertOr400(encounter.workflows[workflow], `${workflow} workflow not planned`);
    return encounter.workflows[workflow];
  }
  function doStartWorkflow() {
    const {
      employment_id
    } = organization_employment;
    const existing_patient_encounter_employee_id = encounter.all_employees_seen.find((employee) => employee.employee_id === employment_id)?.patient_encounter_employee_id || null;
    return patient_workflows.start(trx, {
      encounter,
      employment_id,
      existing_patient_encounter_employee_id,
      patient_workflow_id: workflow_status.patient_workflow_id
    });
  }
  function maybeMovePatientIntoWorkflow() {
    if (opts.patient_presence !== "move_into_specificed_workflow") return;
    return patient_presence.set(ctx.state.trx, encounter.patient.id, {
      current_workflow: workflow,
      department_name: department_handling_workflow,
      next_workflow: null
    });
  }
  function stepToRouteTo() {
    const first_incomplete_step = WORKFLOW_STEPS[workflow].find((s) => {
      if (arrayIsEmpty(workflow_status.steps_completed)) return true;
      return !workflow_status.steps_completed.includes(s);
    });
    if (opts.planning === "do_not_create_only_start_if_already_planned") {
      assert(first_incomplete_step, "There must be some incomplete step if the workflow is not completed");
    }
    return first_incomplete_step || WORKFLOW_STEPS[workflow][0];
  }
}
const handler = postHandler(StartWorkflowSchema, (ctx, {
  workflow
}) => startWorkflow(ctx, workflow, {
  planning: "do_not_create_only_start_if_already_planned",
  patient_presence: "move_into_specificed_workflow"
}).then(redirect));
export {
  handler as h,
  startWorkflow as s
};
