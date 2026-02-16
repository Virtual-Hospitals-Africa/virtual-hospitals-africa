import { NonEmptyArray, RenderedOrganizationWithDepartments, TrxOrDbOrQueryCreator } from '../../types.ts'
import { jsonArrayFrom, orderByArrayPosition } from '../helpers.ts'
import { base } from './_base.ts'
import { DEPARTMENTS } from '../../shared/departments.ts'
import { organizations, type OrganizationSearch } from './organizations.ts'

function baseQuery(trx: TrxOrDbOrQueryCreator, opts: OrganizationSearch) {
  return organizations.baseQuery(trx, opts)
    .select((eb) => [
      jsonArrayFrom(
        eb.selectFrom('organization_departments')
          .innerJoin(
            'departments',
            'departments.name',
            'organization_departments.name',
          )
          .select([
            'organization_departments.id',
            'organization_departments.name',
          ])
          .whereRef(
            'organization_departments.organization_id',
            '=',
            'organizations.id',
          ).orderBy(
            (eb_organization_departments_order) =>
              orderByArrayPosition(
                eb_organization_departments_order,
                'organization_departments.name',
                DEPARTMENTS as NonEmptyArray<string>,
              ),
            'desc',
          ),
      ).as('departments'),
    ])
}

export const organizations_with_departments = base({
  top_level_table: 'organizations',
  // caching: {
  //   number_of_items: 100,
  // },
  baseQuery,
  formatResult: (x: RenderedOrganizationWithDepartments): RenderedOrganizationWithDepartments => x,
})
