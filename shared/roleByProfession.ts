import { HealthWorkerOrganization, Profession } from '../types.ts'

export default function roleByProfession(
  organization_employment: HealthWorkerOrganization,
  profession: Profession | 'admin',
): undefined | HealthWorkerOrganization {
  if (profession === 'admin' && organization_employment.is_admin) {
    return organization_employment
  } else if (organization_employment.profession === profession) {
    return organization_employment
  }
}
