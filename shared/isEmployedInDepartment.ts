import { HealthWorkerOrganization } from '../types.ts'
import { Department } from './departments.ts'

export default function isEmployedInDepartment(
  organization_employment: HealthWorkerOrganization,
  department_name: Department,
): undefined | { id: string; name: string } {
  return organization_employment.in_departments.find(
    (d) => d.name === department_name,
  )
}
