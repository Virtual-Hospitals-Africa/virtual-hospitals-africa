import { create } from '../create.ts'
import * as organizations from '../../models/organizations.ts'
import { testOrganizationDepartments } from '../../../test/_helpers/organizations.ts'

export default create(
  ['organization_departments'],
  async (trx) => {
    const test_organizations = await trx.selectFrom('organizations').where(
      'is_test',
      '=',
      true,
    ).select(['id', 'category']).execute()
    for (
      const organization of test_organizations
    ) {
      const departments = testOrganizationDepartments(
        organization.category || 'Unknown',
      )
      await organizations.addDepartments(
        trx,
        organization.id,
        departments,
      )
    }
  },
)
