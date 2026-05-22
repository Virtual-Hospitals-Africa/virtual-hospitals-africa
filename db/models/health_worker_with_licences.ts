import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { base, identity } from './_base.ts'
import { health_worker_licences, LicenceSearch } from './health_worker_licences.ts'
import { health_workers_base } from './health_workers_base.ts'

type WithLicencesSearch = LicenceSearch & {
  search?: string // health worker name search
}

export const health_worker_with_licences = base({
  top_level_table: 'health_worker_licences',
  baseQuery(
    trx: TrxOrDbOrQueryCreator,
    opts: WithLicencesSearch,
  ) {
    return health_worker_licences.baseQuery(trx, opts)
      .innerJoin(
        health_workers_base.baseQuery(trx, opts).as('health_workers_base'),
        'health_workers_base.id',
        'health_worker_licence_numbers.health_worker_id',
      )
      .selectAll('health_workers_base')
  },
  formatResult: identity,
})
