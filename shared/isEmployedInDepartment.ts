import { HealthWorkerOrganization } from '../types.ts'
import { Department } from './departments.ts'

export default function isEmployedInDepartment(
  organization_employment: HealthWorkerOrganization,
  department_name: Department,
): boolean {
  for (const role of organization_employment.roles) {
    for (const department of role.departments) {
      if (department.name === department_name) {
        return true
      }
    }
  }
  return false
}
