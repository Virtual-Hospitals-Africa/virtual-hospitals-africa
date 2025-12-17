import { define } from '../define.ts'
import * as organizations from '../../models/organizations.ts'
import { testOrganizationDepartments } from '../../../test/_helpers/organizations.ts'
import { Department } from '../../../shared/departments.ts'

function roomNames(department: Department): string[] {
  switch (department) {
    case 'primary care':
      return ['primary care room 101', 'primary care room 102']
    case 'maternity':
      return ['maternity room 1']
    case 'immunizations':
      return ['immunizations room 1']
    case 'chronic diseases':
      return ['chronic diseases room 1']
    case 'reception':
      return ['reception']
    case 'oncology':
      return ['oncology room 1']
    case 'burns':
      return ['burns room 1']
    case 'remote care':
      return ['remote care room 1']
    case 'waiting room':
      return ['waiting room']
    case 'triage':
      return ['triage room 1', 'triage room 2']
    case 'administration':
      return ['administration']
    case 'pharmacy':
      return ['pharmacy']
    case 'emergency':
      return ['resuscitation area']
    default:
      throw new Error(`Unrecognized department ${department}`)
  }
}

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
          room_names: roomNames(name),
        })),
      )
    }
  },
)
