import type { RenderedCountryHealthWorker, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { base, identity } from './_base.ts'
import { health_worker_licences } from './health_worker_licences.ts'
import { health_workers_base, HealthWorkerSearch } from './health_workers_base.ts'
import { health_worker_organizations } from './health_worker_organizations.ts'

export const country_health_workers = base({
  top_level_table: 'health_workers',
  baseQuery(
    trx: TrxOrDb,
    opts: HealthWorkerSearch & {
      country: string
    },
  ) {
    return health_workers_base.baseQuery(trx, opts)
      .select((eb) => [
        jsonArrayFrom(
          health_worker_organizations.baseQuery(trx, {
            country: opts.country,
          })
            .where(
              'employment.health_worker_id',
              '=',
              eb.ref('health_workers.id'),
            ),
        ).as('organizations'),
        jsonArrayFrom(
          health_worker_licences.baseQuery(trx, {
            status: 'all',
          })
            .where('health_worker_id', '=', eb.ref('health_workers.id'))
            .where('country', '=', opts.country),
        ).as('licences'),
      ])
  },
  formatResult: identity<RenderedCountryHealthWorker>,
})
