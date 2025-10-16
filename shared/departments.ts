import { assert } from 'std/assert/assert.ts'
import { Workflow } from '../db.d.ts'
import entries from '../util/entries.ts'
import fromEntries from '../util/fromEntries.ts'
import { Maybe, Profession, RenderedOrganization } from '../types.ts'
import { StatusError } from '../util/assertOr.ts'

export const DEPARTMENTS = [
  'primary care' as const,
  'maternity' as const,
  'immunizations' as const,
  'chronic diseases' as const,
  'reception' as const,
  'waiting room' as const,
  'triage' as const,
  'administration' as const,
  'pharmacy' as const,
  'oncology' as const,
  'burns' as const,
  'remote care' as const,
  'resus' as const,
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
  seeking_treatment: 'primary care',
  maternity: 'maternity',
  registration: 'reception',
  triage: 'triage',
  prescription_refill: 'pharmacy',
  doctor_review: 'remote care',
  stabilization: 'resus',
} satisfies {
  [w in Workflow]: Department
}

function workflowsOfDepartment(department: Department): Workflow[] {
  const workflows: Workflow[] = []
  for (const [workflow, workflow_department] of entries(WORKFLOW_DEPARTMENTS)) {
    if (department === workflow_department) {
      workflows.push(workflow)
    }
  }
  return workflows
}

export const DEPARTMENTS_REQUIRING_TRIAGE = new Set<Department>([
  'primary care',
  'maternity',
  'immunizations',
  'chronic diseases',
  'oncology',
  'burns',
  'remote care',
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
  return WORKFLOW_DEPARTMENTS[workflow] === department
}

export function assertDepartmentResponsibleForWorkflow(
  department: Department,
  workflow: Workflow,
) {
  assert(departmentResponsibleForWorkflow(department, workflow))
}

export function departmentsOfProfession(
  profession: Profession,
  specialty?: Maybe<string>,
): Department[] {
  switch (profession) {
    case 'nurse': {
      assert(specialty)
      switch (specialty) {
        case 'triage':
          return ['triage', 'reception']
        case 'primary care':
          return ['primary care', 'triage', 'reception']
        default: {
          throw new StatusError(`${specialty} not yet supported`, 400)
        }
      }
    }
    case 'doctor': {
      assert(specialty)
      switch (specialty) {
        case 'primary care':
          return ['primary care', 'triage', 'reception']
        default: {
          throw new StatusError(`${specialty} not yet supported`, 400)
        }
      }
    }
    case 'receptionist': {
      return ['reception']
    }
    case 'admin': {
      return ['administration']
    }
    default: {
      throw new Error(`Unreachable, profession ${profession}`)
    }
  }
}

export function organizationDepartmentIdsOfProfession(
  organization: RenderedOrganization,
  profession: Profession,
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
