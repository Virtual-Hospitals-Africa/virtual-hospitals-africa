import {
  HealthWorkerOrganization,
  MedicineGroupWithPermissions,
  RecommendedMedicineGroup,
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

    const unsatisfied_done_by = done_by.find((permission) => !satisfiesPermission({ ...me, senior_on_duty }, permission))
    if (unsatisfied_done_by) {
      const employees_who_can_do = clinic_employees.filter((employee) => done_by.every((permission) => satisfiesPermission(employee, permission)))
      const [on_duty, off_duty] = partition(employees_who_can_do, (employee) => employee.at_work)
      return {
        type: 'cant_do',
        permitted: unsatisfied_done_by.role,
        employees_who_can_do: { on_duty, off_duty },
      }
    }

    const unsatisfied_approved_by = approved_by.find((permission) => !satisfiesPermission({ ...me, senior_on_duty }, permission))
    if (unsatisfied_approved_by) {
      const employees_who_can_approve = clinic_employees.filter((employee) => approved_by.every((permission) => satisfiesPermission(employee, permission)))
      const [on_duty, off_duty] = partition(employees_who_can_approve, (employee) => employee.at_work)
      return {
        type: 'approval_needed',
        permitted: unsatisfied_approved_by.role,
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

// The EML expresses who may prescribe as free text ("Doctor prescribed",
// "Specialist initiated", "Dentist, Dental therapist", …). Coarsely bucket
// those onto the roles we staff at a facility. `permitted` doubles as the icon
// key shown when nobody at the facility holds a qualifying role.
function prescriberRequirement(prescriber: string | null): { permitted: string; roles: string[] } | null {
  if (!prescriber) return null
  const text = prescriber.toLowerCase()
  if (text.includes('dentist') || text.includes('dental')) return { permitted: 'dentist', roles: [] }
  if (text.includes('specialist')) return { permitted: 'specialist', roles: ['specialist'] }
  if (text.includes('doctor') && text.includes('nurse')) return { permitted: 'nurse', roles: ['doctor', 'nurse'] }
  if (text.includes('nurse')) return { permitted: 'nurse', roles: ['nurse'] }
  // "Doctor", "Doctor prescribed", and anything unrecognized: require a doctor
  return { permitted: 'doctor', roles: ['doctor'] }
}

export function applyPrescriberPermissions(
  me: Me,
  clinic_employees: RenderedEmployeeWithPresenceAndSeniority[],
  medicine_groups: RecommendedMedicineGroup[],
): MedicineGroupWithPermissions[] {
  function getPermissions(prescriber: string | null): TaskPermissions {
    const requirement = prescriberRequirement(prescriber)
    if (!requirement || requirement.roles.includes(me.role)) {
      return { type: 'no_approval_needed' }
    }
    const employees_who_can_do = clinic_employees.filter((employee) => requirement.roles.includes(employee.role))
    const [on_duty, off_duty] = partition(employees_who_can_do, (employee) => employee.at_work)
    return {
      type: 'cant_do',
      permitted: requirement.permitted,
      employees_who_can_do: { on_duty, off_duty },
    }
  }

  return medicine_groups.map((group) => ({
    name: group.medicine_name,
    due_to: group.due_to,
    forms: group.forms.map((form) => ({
      form_route: form.form_route,
      options: form.options
        .map((option) => ({ option, permissions: getPermissions(option.prescriber) }))
        .toSorted((a, b) => PERMISSION_ORDER[a.permissions.type] - PERMISSION_ORDER[b.permissions.type]),
    })),
  }))
}
