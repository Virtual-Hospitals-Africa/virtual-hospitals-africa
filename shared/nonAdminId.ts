import assertLength from '../util/assertLength.ts'

export function nonAdminId(
  organization_employment: HealthWorkerOrganization,
): string | null {
  const non_admin_roles = organization_employment.roles.filter((role) =>
    role.profession !== 'admin'
  )
  if (!non_admin_roles.length) return null
  assertLength(non_admin_roles, 1)
  return non_admin_roles[0].employment_id
}
