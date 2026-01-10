import { define } from '../define.ts'
import { organizations } from '../../models/organizations.ts'
import {
  testOrganizationDepartments,
  testOrganizationRoomNames,
} from '../../../test/_helpers/organizations.ts'
import { DEPARTMENT_DEFS } from '../../../shared/departments.ts'
import entries from '../../../util/entries.ts'

export default define(
  [
    'departments',
    'organization_departments',
    'organization_rooms',
    'organization_department_rooms',
  ],
  async (trx) => {
    await trx.insertInto('departments')
      .values(
        entries(DEPARTMENT_DEFS).map((
          [name, { requires_triage, workflows }],
        ) => ({ name, requires_triage, workflows })),
      )
      .execute()

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
