import type { HasStringId, HealthWorker, IdSelection, Maybe, TrxOrDb } from '../../types.ts'
import { concat } from '../helpers.ts'
import { Profession } from '../../db.d.ts'
import { base, identity } from './_base.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import isString from '../../util/isString.ts'

export type HealthWorkerSearch = {
  search?: Maybe<string>
  organization_id?: string | string[] | IdSelection
  professions?: Maybe<Profession[]>
  prioritize_organization_id?: Maybe<string>
  excluding_health_worker_id?: string
}

export const health_workers_base = base({
  top_level_table: 'health_workers',
  // caching: {
  //   number_of_items: 100,
  // },
  baseQuery(trx: TrxOrDb, opts: HealthWorkerSearch) {
    let qb = trx
      .selectFrom('health_workers')
      .leftJoin('health_worker_accounts', 'health_worker_accounts.id', 'health_workers.id')
      .select((eb) => [
        'health_workers.id',
        'health_workers.name',
        'health_workers.first_names',
        'health_workers.surname',
        'health_workers.preferred_name',
        'health_worker_accounts.email',
        eb.case()
          .when('health_worker_accounts.avatar_media_id', 'is not', null)
          .then(concat('/health_workers/', eb.ref('health_workers.id'), '/avatar'))
          .end()
          .as('avatar_url'),
      ])

    if (opts.search) {
      qb = qb.where('health_workers.name', 'ilike', `%${opts.search}%`)
    }

    if (opts.professions) {
      assertOr400(opts.professions.length > 0, 'professions must not be empty')
      qb = qb.where(
        'health_workers.id',
        'in',
        trx.selectFrom('employment')
          .where('profession', 'in', opts.professions)
          .select('health_worker_id'),
      )
    }

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
