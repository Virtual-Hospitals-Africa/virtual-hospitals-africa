import { NonEmptyArray, RenderedOrganizationWithDepartments, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom, orderByArrayPosition } from '../helpers.ts'
import { base } from './_base.ts'
import { DEPARTMENTS } from '../../shared/departments.ts'
import { organizations, type OrganizationSearch } from './organizations.ts'

import { SERVER_COUNTRY } from './countries.ts'

function baseQuery(trx: TrxOrDb) {
  return organizations.baseQuery(trx, {})
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
  handleSearch(
    qb,
    opts: OrganizationSearch,
  ) {
    if (opts.search) {
      qb = qb.where('organizations.name', 'ilike', `%${opts.search}%`)
    }
    if (opts.kind) {
      qb = qb.where(
        'address_id',
        opts.kind === 'physical' ? 'is not' : 'is',
        null,
      )
    }
    if (opts.is_test != null) {
      qb = qb.where('organizations.is_test', '=', opts.is_test)
    }
    if (!opts.include_all_countries) {
      qb = qb.where('organizations.country', '=', SERVER_COUNTRY)
    }
    if (opts.category) {
      qb = qb.where('organizations.category', '=', opts.category)
    }
    if (opts.country) {
      qb = qb.where('organizations.country', '=', opts.country)
    }
    return qb
  },
})
