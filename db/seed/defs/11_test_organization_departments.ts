import { define } from '../define.ts'
import * as organizations from '../../models/organizations.ts'
import {
  testOrganizationDepartments,
  testOrganizationRoomNames,
} from '../../../test/_helpers/organizations.ts'

export default define(
  [
    'organization_departments',
    'organization_rooms',
    'organization_department_rooms',
  ],
  async (trx) => {
    const test_organizations = await trx.selectFrom('organizations').where(
      'is_test',
      '=',
      true,
    ).select(['id', 'category']).execute()
    for (
      const organization of test_organizations
    ) {
      const department_names = testOrganizationDepartments(
        organization.category || 'Unknown',
      )

      await organizations.addDepartments(
        trx,
        organization.id,
        department_names.map((name) => ({
          name,
          room_names: testOrganizationRoomNames(name),
        })),
      )
    }
  },
)
