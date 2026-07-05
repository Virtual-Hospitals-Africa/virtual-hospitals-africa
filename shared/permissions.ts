import {
  HealthWorkerOrganization,
  RenderedEmployeeWithPresenceAndSeniority,
  RenderedLicence,
  RenderedManageTaskToBeDone,
  TaskGroup,
  TaskGroupWithPermissions,
  TaskPermissions,
} from '../types.ts'
import partition from '../util/partition.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { isManage } from './tasks.ts'

// The permissions a `manage` procedure can carry (see `manage`/`permission_entry`
// in shared/s_expression_schemas.ts):
//   (done_by (role …))     restricts who is allowed to perform the task
//   (approved_by (role …)) requires the task to be approved by someone else
type Permission = NonNullable<RenderedManageTaskToBeDone['permissions']>[number]

// Everything we need to know about the current health worker to evaluate
// whether they personally satisfy a permission. `organization_employment`
// (HealthWorkerOrganization) satisfies this shape.
type Me = Pick<HealthWorkerOrganization, 'role' | 'active_licences'>

// Anyone we can evaluate a permission against: the current worker (`me`) or
// another clinic employee. Clinic employees don't carry `active_licences`, so a
// specialty requirement can only be confirmed for someone whose licences we have.
type Candidate = {
  role: string
  senior_on_duty: boolean
  active_licences?: RenderedLicence[]
}

function satisfiesSpecialty(candidate: Candidate, specialty: string | undefined): boolean {
  if (!specialty) return true
  return (candidate.active_licences ?? []).some((licence) => licence.specialty === specialty)
}

// Does the candidate satisfy this permission's role (and specialty, if any)?
// `shcp` is the senior health care provider, which is determined by seniority
// rather than by `role`.
function satisfiesPermission(candidate: Candidate, permission: Permission): boolean {
  const role_matches = permission.role === 'shcp' ? candidate.senior_on_duty : candidate.role === permission.role
  return role_matches && satisfiesSpecialty(candidate, permission.specialty)
}

// Tasks not needing permission first, those needing approval next, and those
// outside the scope of practice (cant_do) last.
const PERMISSION_ORDER = {
  no_approval_needed: 0,
  approval_needed: 1,
  cant_do: 2,
}

export function applyPermissions(
  me: Me,
  clinic_employees: RenderedEmployeeWithPresenceAndSeniority[],
  task_groups: TaskGroup[],
): TaskGroupWithPermissions[] {
  // clinic_employees excludes me, and `senior_on_duty` is computed relative to
  // me, so if no present employee is the senior on duty then I am.
  const senior_on_duty = !clinic_employees.some((employee) => employee.senior_on_duty)

  function getPermissions(task: RenderedManageTaskToBeDone): TaskPermissions {
    const done_by = (task.permissions ?? []).filter((permission) => permission.type === 'done_by')
    const approved_by = (task.permissions ?? []).filter((permission) => permission.type === 'approved_by')
    assertEquals(task.permissions?.length || 0, done_by.length + approved_by.length)

    const cant_do = done_by.some((permission) => !satisfiesPermission({ ...me, senior_on_duty }, permission))
    if (cant_do) {
      const employees_who_can_do = clinic_employees.filter((employee) => done_by.every((permission) => satisfiesPermission(employee, permission)))
      const [on_duty, off_duty] = partition(employees_who_can_do, (employee) => employee.at_work)
      return {
        type: 'cant_do',
        employees_who_can_do: { on_duty, off_duty },
      }
    }

    const approval_needed = approved_by.some((permission) => !satisfiesPermission({ ...me, senior_on_duty }, permission))
    if (approval_needed) {
      const employees_who_can_approve = clinic_employees.filter((employee) => approved_by.every((permission) => satisfiesPermission(employee, permission)))
      const [on_duty, off_duty] = partition(employees_who_can_approve, (employee) => employee.at_work)
      return {
        type: 'approval_needed',
        employees_who_can_approve: { on_duty, off_duty },
      }
    }

    return {
      type: 'no_approval_needed',
    }
  }

  // Task groups sharing the same due_to records are merged.
  const groups = new Map<string, TaskGroupWithPermissions>()
  for (const task_group of task_groups) {
    const tasks = task_group.tasks.filter(isManage).map((task) => ({ task, permissions: getPermissions(task) }))
    if (!tasks.length) continue
    const key = task_group.due_to.map((record) => record.id).join('-')
    const group = groups.get(key)
    if (group) {
      group.tasks.push(...tasks)
    } else {
      groups.set(key, { due_to: task_group.due_to, tasks })
    }
  }
  return [...groups.values()].map((group) => ({
    ...group,
    tasks: group.tasks.toSorted((a, b) => PERMISSION_ORDER[a.permissions.type] - PERMISSION_ORDER[b.permissions.type]),
  }))
}

// export function divideTasksByPermissionsNeeded(
//   me: Me,
//   clinic_employees: RenderedEmployeeWithPresenceAndSeniority[],
//   manage_patient_tasks: RenderedManageTaskToBeDone[],
// ): TasksDividedByPermission {
//   // clinic_employees excludes me, and `senior_on_duty` is computed relative to
//   // me, so if no present employee is the senior on duty then I am.
//   const senior_on_duty = !clinic_employees.some((employee) => employee.senior_on_duty)

//   const [tasks_i_can_do, tasks_i_cant_ever_do] = partition(
//     manage_patient_tasks,
//     (task) => {
//       const done_by = (task.permissions ?? []).filter((permission) => permission.type === 'done_by')
//       return !done_by.length || done_by.some((permission) => satisfiesPermission({ ...me, senior_on_duty }, permission))
//     },
//   )

//   const [tasks_i_can_do_with_approval, tasks_i_can_do_without_approval_needed] = partition(
//     tasks_i_can_do,
//     (task) => (task.permissions ?? []).some((permission) => permission.type === 'approved_by'),
//   )

//   // For the tasks I can't handle alone, work out which present colleagues could
//   // approve them (for tasks I can do with approval) or do them in my stead (for
//   // tasks I'm not permitted to do). A task is keyed under an employee only if
//   // they satisfy the relevant permission.
//   const tasks_can_be_approved_by = new Map<RenderedEmployeeWithPresenceAndSeniority, RenderedManageTaskToBeDone[]>()
//   const tasks_can_be_done_by = new Map<RenderedEmployeeWithPresenceAndSeniority, RenderedManageTaskToBeDone[]>()
//   for (const clinic_employee of clinic_employees) {
//     const can_approve = tasks_i_can_do_with_approval.filter((task) =>
//       (task.permissions ?? []).some((permission) => permission.type === 'approved_by' && satisfiesPermission(clinic_employee, permission))
//     )
//     if (can_approve.length) tasks_can_be_approved_by.set(clinic_employee, can_approve)

//     const can_do = tasks_i_cant_ever_do.filter((task) =>
//       (task.permissions ?? []).some((permission) => permission.type === 'done_by' && satisfiesPermission(clinic_employee, permission))
//     )
//     if (can_do.length) tasks_can_be_done_by.set(clinic_employee, can_do)
//   }

//   return {
//     tasks_i_can_do_without_approval_needed,
//     tasks_i_can_do_with_approval,
//     tasks_i_cant_ever_do,
//     tasks_can_be_approved_by,
//     tasks_can_be_done_by,
//   }
// }

// tasks_i_cant_ever_do.length => hand_over (may also manage if tasks_i_can_do_without_approval_needed)
// tasks_i_cant_ever_do.length => hand_over (may also manage if tasks_i_can_do_without_approval_needed)
// tasks_i_can_do_without_approval_needed.length => manage, but whether you manage them now depends on urgency
//
