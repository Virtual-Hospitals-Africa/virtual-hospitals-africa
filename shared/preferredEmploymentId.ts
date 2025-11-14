import { HealthWorkerOrganization } from '../types.ts'
import assertLength from '../util/assertLength.ts'
import partition from '../util/partition.ts'

// Unless otherwise specified, we prefer the non-admin employment role. If the admin is the only role, accept that
export function preferredEmploymentId(
  organization_employment: HealthWorkerOrganization,
): string {
  const [admin_roles, non_admin_roles] = partition(
    organization_employment.roles,
    (role) => role.profession === 'admin',
  )
  if (non_admin_roles.length) {
    assertLength(non_admin_roles, 1)
    return non_admin_roles[0].employment_id
  }
  assertLength(admin_roles, 1)
  return admin_roles[0].employment_id
}
