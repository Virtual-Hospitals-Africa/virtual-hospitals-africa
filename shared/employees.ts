import { RenderedEmployee } from '../types.ts'
import { exists } from '../util/exists.ts'
import matching from '../util/matching.ts'

export function organizationOf(employee: RenderedEmployee) {
  return exists(employee.organizations.find(matching({
    id: employee.organization_id,
  })))
}
