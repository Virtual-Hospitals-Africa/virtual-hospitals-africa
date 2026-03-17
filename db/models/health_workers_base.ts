import type { HasStringId, HealthWorker, IdSelection, Maybe, TrxOrDbOrQueryCreator } from '../../types.ts'
import { concat, jsonBuildObject, jsonObjectFrom } from '../helpers.ts'
import { base, identity } from './_base.ts'
import isString from '../../util/isString.ts'
import { health_worker_licences } from './health_worker_licences.ts'
import { addresses } from './addresses.ts'

export type HealthWorkerSearch = {
  search?: Maybe<string>
  organization_id?: string | string[] | IdSelection
  roles?: Maybe<string[]>
  prioritize_organization_id?: Maybe<string>
  excluding_health_worker_id?: string
}

export const health_workers_base = base({
  top_level_table: 'health_workers',
  // caching: {
  //   number_of_items: 100,
  // },
  baseQuery(trx: TrxOrDbOrQueryCreator, opts: HealthWorkerSearch) {
    let qb = trx
      .selectFrom('health_workers')
      .leftJoin('health_worker_accounts', 'health_worker_accounts.id', 'health_workers.id')
      .leftJoin('health_worker_demographics', 'health_worker_demographics.id', 'health_workers.id')
      .leftJoin('health_worker_contact_details', 'health_worker_contact_details.id', 'health_workers.id')
      .select((eb) => [
        'health_workers.id',
        'health_workers.name',
        'health_workers.first_names',
        'health_workers.surname',
        'health_workers.preferred_name',
        'health_worker_accounts.email',
        'health_worker_accounts.settings',
        jsonBuildObject({
          sex: eb.ref('health_worker_demographics.sex'),
          gender: eb.ref('health_worker_demographics.gender'),
          date_of_birth: eb.ref('health_worker_demographics.date_of_birth'),
        }).as('demographics'),
        jsonBuildObject({
          mobile_phone_number: eb.ref('health_worker_contact_details.mobile_phone_number'),
          address: jsonObjectFrom(
            addresses.baseQuery(trx, {})
              .where('addresses.id', '=', eb.ref('health_worker_contact_details.address_id')),
          ),
        }).as('contact_details'),
        eb.case()
          .when('health_worker_accounts.avatar_media_id', 'is not', null)
          .then(concat('/health_workers/', eb.ref('health_workers.id'), '/avatar'))
          .end()
          .as('avatar_url'),
        eb.exists(
          health_worker_licences.baseQuery(trx, {
            status: 'all',
            doctor: true,
          })
            .where('health_worker_licence_numbers.health_worker_id', '=', eb.ref('health_workers.id')),
        ).as('ever_licensed_as_doctor'),
      ])

    if (opts.search) {
      qb = qb.where('health_workers.name', 'ilike', `%${opts.search}%`)
    }

    // TODO: look this up via active licences
    // if (opts.roles) {
    //   assertOr400(opts.roles.length > 0, 'roles must not be empty')
    //   qb = qb.where(
    //     'health_workers.id',
    //     'in',
    //     trx.selectFrom('employment')
    //       .where('profession', 'in', opts.roles)
    //       .select('health_worker_id'),
    //   )
    // }

    if (opts.organization_id) {
      qb = qb.where(
        'health_workers.id',
        'in',
        trx.selectFrom('employment')
          .where(
            'organization_id',
            'in',
            isString(opts.organization_id) ? [opts.organization_id] : opts.organization_id,
          )
          .$if(!!opts.roles, (qb) => qb.where('employment.role', 'in', opts.roles!))
          .select('health_worker_id'),
      )
    } else if (opts.roles) {
      qb = qb.where(
        'health_workers.id',
        'in',
        trx.selectFrom('employment')
          .where('employment.role', 'in', opts.roles)
          .select('health_worker_id'),
      )
    }

    if (opts.prioritize_organization_id) {
      qb = qb.orderBy(
        (eb) =>
          eb.exists(
            eb.selectFrom('employment')
              .whereRef(
                'employment.health_worker_id',
                '=',
                'health_workers.id',
              )
              .where(
                'employment.organization_id',
                '=',
                opts.prioritize_organization_id!,
              ),
          ),
        'desc',
      )
    }

    if (opts.excluding_health_worker_id) {
      qb = qb.where('health_workers.id', '!=', opts.excluding_health_worker_id)
    }

    return qb
  },
  formatResult: identity<HasStringId<HealthWorker>>,
})
