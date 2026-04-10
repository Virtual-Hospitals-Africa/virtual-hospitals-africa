import { r as redirect, b2 as preferredName, br as firstIncompleteStepStatus, aS as WORKFLOW_STEPS, O as OpenEncounterWorkflowPage, m as assert, U as completedPersonal, y as completeLastStep, a2 as promiseProps, Y as success, F as object, G as string, _ as _enum, bs as TRIAGE_ROUTE_PATIENT_NEXT_STEPS, bk as partition, u, bt as TriageRoutePatientSection, bn as additional_tasks, $ as assertOrRedirect, bj as isManage } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { e as employees_presence } from "./employees_presence-3gMzve44.mjs";
import { p as patient_presence } from "./patient_presence-BDsaizBc.mjs";
import { s as startWorkflow } from "./start-workflow-qhduKPTt.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./organizations-DBMxrctL.mjs";
import "./addresses-DYgdsFAd.mjs";
function redirectToFirstIncompleteStep(ctx, opts) {
  const workflow = ctx.state.encounter.status.patient_presence.current_workflow;
  if (!workflow) {
    return redirect("/app", {
      warning: `No current workflow for ${preferredName(ctx.state.patient, "the patient")} found`
    });
  }
  const workflow_status = ctx.state.encounter.workflows[workflow];
  const first_step = workflow_status ? firstIncompleteStepStatus(workflow_status) : WORKFLOW_STEPS[workflow][0];
  const search_params = ctx.url.searchParams;
  if (opts?.warning_message) {
    search_params.set("warning", opts.warning_message);
  }
  return redirect(`${ctx.state.open_encounter_pathname}/${workflow}/${first_step}`, search_params);
}
const TriageRoutePatientSchema = object({
  next_step: _enum(TRIAGE_ROUTE_PATIENT_NEXT_STEPS),
  notes: string().nullish(),
  health_worker_ids_to_be_notified: string().uuid().array()
});
const handler$1 = postHandler(TriageRoutePatientSchema, async (ctx, {
  next_step
  /*, notes */
}) => {
  const {
    trx,
    patient,
    organization,
    organization_employment
  } = ctx.state;
  assert(completedPersonal(patient));
  const completing_last_step = completeLastStep(ctx);
  switch (next_step) {
    case "await_consultation": {
      const patient_presence_updates = {
        current_workflow: null,
        department_name: "Waiting room",
        next_workflow: "consultation"
      };
      await Promise.all([completing_last_step, patient_presence.set(trx, patient.id, patient_presence_updates), trx.updateTable("employment_presence").set({
        with_patient_id: null
      }).where("employment_presence.id", "=", organization_employment.employment_id).execute()]);
      const redirect_success_message = `Please escort ${patient.names.preferred_name} to the waiting room to await consultation.`;
      return redirect(success(redirect_success_message, `/app/organizations/${organization.id}/waiting_room`));
    }
    case "manage_and_refer":
    case "refer": {
      const {
        redirect_to
      } = await promiseProps({
        completing_last_step,
        redirect_to: startWorkflow(ctx, "referral_placed", {
          planning: "create_anew_every_time",
          patient_presence: "move_into_specificed_workflow"
        })
      });
      return redirect(redirect_to);
    }
    // case 'stabilize_patient': {
    // }
    default: {
      throw new Error("Not yet supported");
    }
  }
});
async function managePatientTasks(ctx) {
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
  const some_non_manage_task_incomplete = task_groups.some((task_group) => !task_group.completed && task_group.tasks.some((task) => task.atom === "finding" || task.atom === "measurement"));
  const is_emergency = encounter.priority?.name === "Emergency";
  assertOrRedirect(is_emergency || !some_non_manage_task_incomplete, `${open_encounter_pathname}/triage/additional_tasks_and_investigations`);
  const manage_patient_tasks = task_groups.flatMap((task_group) => task_group.tasks.filter(isManage));
  return manage_patient_tasks;
}
async function PatientTriageRoutePatientPage(ctx) {
  const {
    trx,
    patient,
    health_worker_id,
    organization_id,
    organization_employment,
    encounter
  } = ctx.state;
  const {
    reason,
    notes,
    priority
  } = encounter;
  console.log(encounter);
  if (!priority) {
    return redirectToFirstIncompleteStep(ctx, {
      warning_message: "Please complete triage before routing the patient"
    });
  }
  assert(completedPersonal(patient));
  const {
    clinic_employees,
    manage_patient_tasks
  } = await promiseProps({
    clinic_employees: employees_presence.findAll(trx, {
      organization_id,
      excluding_health_worker_id: health_worker_id
    }),
    manage_patient_tasks: managePatientTasks(ctx)
  });
  const [tasks_i_can_do, tasks_for_another] = partition(manage_patient_tasks, (task) => {
    const {
      permissions
    } = task;
    if (!permissions?.length) return true;
    return permissions.some((p) => p.role === organization_employment.role && !p.specialty || organization_employment.active_licences.some((licence) => licence.specialty === p.specialty));
  });
  return u(TriageRoutePatientSection, {
    this_visit: {
      reason,
      notes
    },
    patient,
    priority,
    clinic_employees,
    tasks_i_can_do,
    tasks_for_another
  });
}
const route_patient = OpenEncounterWorkflowPage(PatientTriageRoutePatientPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_triage_route_patient = route_patient;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_triage_route_patient as default,
  handler,
  handlers
};
