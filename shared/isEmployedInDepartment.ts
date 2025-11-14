import { HealthWorkerOrganization } from '../types.ts'
import { Department } from './departments.ts'

export default function isEmployedInDepartment(
  organization_employment: HealthWorkerOrganization,
  department_name: Department,
): boolean {
  for (const department_id of organization_employment.department_ids) {
    const department = organization_employment.departments.find(
      (d) => d.id === department_id,
    )
    if (department?.name === department_name) {
      return true
    }
  }
  return false
}
