import type { HealthWorkerOrganization, NonEmptyArray, TrxOrDb } from '../../types.ts'
import { organizations } from './organizations.ts'
import { jsonArrayFrom, orderByArrayPosition } from '../helpers.ts'
import { base, identity } from './_base.ts'
import { DEPARTMENTS } from '../../shared/departments.ts'

export const health_worker_organizations = base({
  top_level_table: 'organizations',
  baseQuery(trx: TrxOrDb, opts: { country?: string }) {
    return organizations.baseQuery(trx, opts)
      .innerJoin(
        'employment',
        'employment.organization_id',
        'organizations.id',
      )
      .select((eb_employment) => [
        'employment.id as employment_id',
        'profession',
        'specialty',
        'is_admin',
        jsonArrayFrom(
          eb_employment.selectFrom('department_employment')
            .innerJoin(
              'organization_departments',
              'organization_departments.id',
              'department_employment.department_id',
            )
            .whereRef(
              'department_employment.employment_id',
              '=',
              'employment.id',
            )
            .select([
              'organization_departments.id',
              'organization_departments.name',
            ])
            .orderBy(
              (eb_employment_departments_order) =>
                orderByArrayPosition(
                  eb_employment_departments_order,
                  'organization_departments.name',
                  DEPARTMENTS as NonEmptyArray<string>,
                ),
              'desc',
            ),
        ).as('in_departments'),
      ]).orderBy(
        // TODO order by most recently interacted with?
        (eb_organization_order) =>
          eb_organization_order.case().when(
            'organizations.category',
            'ilike',
            '%ent%',
          ).then(2).when(
            'organizations.category',
            'ilike',
            '%ospital%',
          ).then(1)
            .else(0)
            .end(),
        'desc',
      )
  },
  formatResult: identity<HealthWorkerOrganization>,
})
