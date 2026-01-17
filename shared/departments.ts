import { assert } from 'std/assert/assert.ts'
import { Workflow } from '../db.d.ts'
import entries from '../util/entries.ts'
import fromEntries from '../util/fromEntries.ts'
import { EmployedHealthWorker, HealthWorkerOrganization, Maybe, NonEmptyArray, Profession, RenderedEmployee, RenderedOrganization } from '../types.ts'
import { StatusError } from '../util/assertOr.ts'
import { exists } from '../util/exists.ts'
import matching from '../util/matching.ts'
import memoize from '../util/memoize.ts'

export const DEPARTMENTS = [
  'Primary care' as const,
  'Maternity' as const,
  'Immunizations' as const,
  'Chronic diseases' as const,
  'Reception' as const,
  'Waiting room' as const,
  'Triage' as const,
  'Administration' as const,
  'Pharmacy' as const,
  'Oncology' as const,
  'Burns' as const,
  'Remote care' as const,
  'Emergency' as const,
]

export type Department = (typeof DEPARTMENTS)[number]

export function assertDepartment(
  department_name: string,
): asserts department_name is Department {
  assert(department_name in DEPARTMENT_DEFS)
}

export function assertDepartmentName(
  department: { name: string },
): asserts department is { name: Department } {
  assertDepartment(department.name)
}

export const WORKFLOW_DEPARTMENTS = {
  consultation: ['Primary care'],
  maternity: ['Maternity'],
  registration: ['Reception'],
  emergency_escalation: ['Reception', 'Triage'],
  triage: ['Triage'],
  prescription_refill: ['Pharmacy'],
  doctor_review: ['Remote care'],
  stabilization: ['Emergency'],
} satisfies {
  [w in Workflow]: NonEmptyArray<Department>
}

const workflowsOfDepartment = memoize(function workflowsOfDepartment(department: Department): Workflow[] {
  const workflows: Workflow[] = []
  for (const [workflow, workflow_departments] of entries(WORKFLOW_DEPARTMENTS)) {
    for (const workflow_department of workflow_departments) {
      if (department === workflow_department) {
        workflows.push(workflow)
      }
    }
  }
  return workflows
})

export const DEPARTMENTS_REQUIRING_TRIAGE = new Set<Department>([
  'Primary care',
  'Maternity',
  'Immunizations',
  'Chronic diseases',
  'Oncology',
  'Burns',
  'Remote care',
])

export const DEPARTMENT_DEFS: {
  [dept in Department]: { requires_triage: boolean; workflows: Workflow[] }
} = fromEntries(
  DEPARTMENTS.map((department: Department) => [department, {
    requires_triage: DEPARTMENTS_REQUIRING_TRIAGE.has(department),
    workflows: workflowsOfDepartment(department),
  }]),
)

export function departmentResponsibleForWorkflow(
  department: Department,
  workflow: Workflow,
) {
  const departments: Department[] = WORKFLOW_DEPARTMENTS[workflow]
  return departments.includes(department)
}

export function assertDepartmentResponsibleForWorkflow(
  department: Department,
  workflow: Workflow,
) {
  assert(departmentResponsibleForWorkflow(department, workflow))
}

export function departmentsOfProfession(
  profession: Profession | 'admin',
  specialty?: Maybe<string>,
): Department[] {
  switch (profession) {
    case 'nurse': {
      assert(specialty)
      switch (specialty) {
        case 'triage':
          return ['Triage', 'Reception']
        case 'Primary care':
          return ['Primary care', 'Triage', 'Reception']
        default: {
          throw new StatusError(`${specialty} not yet supported`, 400)
        }
      }
    }
    case 'doctor': {
      assert(specialty)
      switch (specialty) {
        case 'Primary care':
          return ['Primary care', 'Triage', 'Reception']
        default: {
          throw new StatusError(`${specialty} not yet supported`, 400)
        }
      }
    }
    case 'receptionist': {
      return ['Reception']
    }
    case 'admin': {
      return ['Administration']
    }
    default: {
      throw new Error(`Unreachable, profession ${profession}`)
    }
  }
}

export function organizationDepartmentIdsOfProfession(
  organization: RenderedOrganization,
  profession: Profession | 'admin',
  specialty?: Maybe<string>,
): string[] {
  const department_names = departmentsOfProfession(profession, specialty)
  return department_names.map((department_name) => {
    const matching_organization_department = organization.departments.find(
      (department) => department.name === department_name,
    )
    assert(matching_organization_department)
    return matching_organization_department.id
  })
}

export function employeeOrganizationDepartmentNames(
  employee: RenderedEmployee,
): string[] {
  return healthWorkerOrganizationDepartmentNames(
    employee,
    employee.organization_id,
  )
}

export function healthWorkerOrganizationDepartmentNames(
  health_worker: EmployedHealthWorker,
  organization_id: string,
): Department[] {
  const organization_employment = exists(
    health_worker.organizations.find(matching({
      id: organization_id,
    })),
  )
  return departmentNames(organization_employment)
}

export function departmentNames(
  organization_employment: HealthWorkerOrganization,
): Department[] {
  return organization_employment.departments
    .filter((dept) => organization_employment.department_ids.includes(dept.id))
    .map((dept) => dept.name as Department)
}
