import { HealthWorkerOrganization } from '../types.ts'

export default function roleByProfession(
  organization_employment: HealthWorkerOrganization,
  profession: string,
): undefined | HealthWorkerOrganization {
  if (profession === 'admin' && organization_employment.is_admin) {
    return organization_employment
  } else if (organization_employment.role === profession) {
    return organization_employment
  }
}
