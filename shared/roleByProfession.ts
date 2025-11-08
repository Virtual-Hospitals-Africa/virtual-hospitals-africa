import {
  HealthWorkerOrganization,
  HealthWorkerOrganizationRole,
  Profession,
} from '../types.ts'

export default function roleByProfession(
  organization_employment: HealthWorkerOrganization,
  profession: Profession,
): undefined | HealthWorkerOrganizationRole {
  return organization_employment.roles.find((role) =>
    role.profession === profession
  )
}
