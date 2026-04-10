import { bi as uniqueIdentifier, a, b as s, l, bj as isManage, aw as employeeDisplay, bk as partition, u, bl as DueTo, bm as hyphenate, O as OpenEncounterWorkflowPage, y as completeLastStep, au as employees, V as patient_workflows, r as redirect, Y as success, b2 as preferredName, F as object, a2 as promiseProps, bn as additional_tasks, bo as SectionHeader, bp as NoTasks, ax as Person, bq as Badge } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1$2 = ['<label class="flex gap-4 items-center cursor-pointer p-4 rounded-lg border border-gray-300 bg-white hover:border-gray-400 transition-colors"><div class="flex items-center justify-center px-0 py-0.5 w-5 shrink-0"><div class="flex items-center justify-center rounded"><input ', ' type="checkbox" ', ' value="true" ', ' class="w-5 h-5 rounded-md border-gray-400 text-indigo-700 focus:ring-indigo-700"></div></div><span class="text-sm text-gray-800">', "</span></label>"];
function ManagePatientTask({
  task
}) {
  const name = `just_do_it_tasks.${uniqueIdentifier(task)}`;
  return a($$_tpl_1$2, l("id", name), l("name", name), !!task.existing_record ? "checked" : "", s(task.description));
}
const $$_tpl_1$1 = ['<div class="task-group-card flex flex-col gap-4" ', ">", "", "", "</div>"];
const referral_complete_description = "Referral complete";
const referral_complete_task_base = {
  atom: "procedure",
  root_snomed_concept: null,
  specific_snomed_concept: null,
  value: null,
  qualifiers: [],
  attributes: [],
  displays: {
    finding: referral_complete_description,
    value: null,
    full: referral_complete_description
  },
  s_expression: "",
  history: false,
  existing_record: null
};
function ManagePatientGroup({
  group,
  organization_employment,
  organization_id,
  primary_care_nurse
}) {
  const tasks = group.tasks.filter(isManage);
  if (!tasks.length) return null;
  const nurse_display_name = primary_care_nurse ? employeeDisplay(primary_care_nurse).display_name : null;
  const referral_complete_task = {
    ...referral_complete_task_base,
    description: nurse_display_name ? `${referral_complete_description} – ${nurse_display_name}` : referral_complete_description
  };
  const [tasks_i_can_do] = partition(tasks, (task) => {
    const {
      permissions
    } = task;
    if (!permissions?.length) return true;
    return permissions.some((p) => p.role === organization_employment.role && !p.specialty || organization_employment.active_licences.some((licence) => licence.specialty === p.specialty));
  });
  return a($$_tpl_1$1, l("data-due-to", group.due_to.map((x) => hyphenate(x.displays.full)).join("-")), u(DueTo, {
    due_to: group.due_to,
    is_follow_up: false,
    organization_id
  }), s(tasks_i_can_do.map((task) => u(ManagePatientTask, {
    task
  }, uniqueIdentifier(task)))), u(ManagePatientTask, {
    task: referral_complete_task
  }, "confirm_handoff"));
}
const $$_tpl_1 = ['<div class="flex flex-col gap-6"><div class="flex flex-col gap-3 pb-4 pt-2 w-full max-w-3xl">', "", "</div>", "</div>"];
const $$_tpl_2 = ['<div class="flex items-center gap-3">', "", "</div>"];
const $$_tpl_3 = ['<div class="flex flex-col gap-3 pb-4 pt-2 w-full max-w-3xl">', "", "</div>"];
const ReferralPlacedConfirmHandoffSchema = object({});
const handler$1 = postHandler(ReferralPlacedConfirmHandoffSchema, async (ctx, _form_values) => {
  const {
    trx,
    encounter,
    organization_id,
    organization_pathname,
    organization_employment,
    patient,
    patient_id,
    patient_encounter_id
  } = ctx.state;
  await completeLastStep(ctx);
  const primary_care_nurse = await employees.findFirst(trx, {
    organization_id,
    can_perform_workflow: "consultation"
  });
  const patient_workflow = await patient_workflows.insertOne(trx, {
    patient_encounter_id,
    workflow: "consultation"
  });
  await patient_workflows.start(trx, {
    encounter,
    employment_id: primary_care_nurse.employee_id,
    patient_workflow_id: patient_workflow.id,
    existing_patient_encounter_employee_id: null
  });
  await trx.updateTable("patient_presence").set({
    current_workflow: "consultation",
    next_workflow: null,
    department_name: "Primary care"
  }).where("id", "=", patient_id).execute();
  await trx.updateTable("employment_presence").set({
    with_patient_id: null
  }).where("id", "=", organization_employment.employment_id).execute();
  await trx.updateTable("employment_presence").set({
    with_patient_id: patient_id
  }).where("id", "=", primary_care_nurse.employee_id).execute();
  return redirect(success(`Referral completed for ${preferredName(patient.names, "patient")}.`, `${organization_pathname}/waiting_room`));
});
async function ReferralPlacedConfirmHandoffPage(ctx) {
  const {
    trx,
    health_worker_id,
    encounter,
    organization_employment,
    organization_id
  } = ctx.state;
  const {
    task_groups
  } = await promiseProps({
    task_groups: additional_tasks.getTasksGroups(trx, {
      health_worker_id,
      encounter
    }).then((r) => r.task_groups)
  });
  const primary_care_nurse = await employees.findFirst(trx, {
    organization_id,
    can_perform_workflow: "consultation"
  });
  const groups_with_manage_tasks = task_groups.filter((group) => group.tasks.some(isManage));
  return a($$_tpl_1, u(SectionHeader, {
    children: "Primary care nurse"
  }), s(primary_care_nurse && a($$_tpl_2, u(Person, {
    person: employeeDisplay(primary_care_nurse)
  }), u(Badge, {
    content: "Awaiting handoff",
    color: "yellow"
  }))), s(groups_with_manage_tasks.length > 0 ? a($$_tpl_3, u(SectionHeader, {
    children: "Patient Management Tasks"
  }), s(groups_with_manage_tasks.map((group, index) => u(ManagePatientGroup, {
    group,
    organization_employment,
    organization_id,
    primary_care_nurse
  }, index)))) : u(NoTasks, null)));
}
const confirm_handoff = OpenEncounterWorkflowPage(ReferralPlacedConfirmHandoffPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_referral_placed_confirm_handoff = confirm_handoff;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_referral_placed_confirm_handoff as default,
  handler,
  handlers
};
