import { assert } from 'std/assert/assert.ts'
import type { EmployedHealthWorker, IdSelection, PossiblyEmployedHealthWorker, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { base, identity } from './_base.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { health_workers_base, HealthWorkerSearch } from './health_workers_base.ts'
import { health_worker_organizations } from './health_worker_organizations.ts'

export const health_workers = base({
  top_level_table: 'health_workers',
  // caching: {
  //   number_of_items: 100,
  // },
  baseQuery(trx: TrxOrDb, opts: HealthWorkerSearch) {
    return health_workers_base.baseQuery(trx, opts)
      .select((eb) => [
        jsonArrayFrom(
          health_worker_organizations.baseQuery(trx, {})
            .where(
              'employment.health_worker_id',
              '=',
              eb.ref('health_workers.id'),
            ),
        ).as('organizations'),
      ])
  },
  formatResult: identity<PossiblyEmployedHealthWorker>,
  getIdByEmail(
    trx: TrxOrDb,
    email: string,
  ) {
    return trx.selectFrom('health_worker_accounts')
      .where('email', '=', email)
      .select('id')
      .executeTakeFirst()
  },

  isHealthWorker(
    health_worker: unknown,
  ): health_worker is PossiblyEmployedHealthWorker {
    return (
      isObjectLike(health_worker) &&
      ('id' in health_worker && typeof health_worker.id === 'string') &&
      ('name' in health_worker && typeof health_worker.name === 'string') &&
      ('email' in health_worker && typeof health_worker.email === 'string')
    )
  },

  isEmployed(
    health_worker: unknown,
  ): health_worker is EmployedHealthWorker {
    return health_workers.isHealthWorker(health_worker) &&
      'organizations' in health_worker &&
      Array.isArray(health_worker.organizations) &&
      !!health_worker.organizations.length
  },

  getAvatar(trx: TrxOrDb, opts: { health_worker_id: string }) {
    return trx
      .selectFrom('media')
      .innerJoin('health_worker_accounts', 'health_worker_accounts.avatar_media_id', 'media.id')
      .select(['media.mime_type', 'media.binary_data'])
      .where('health_worker_accounts.id', '=', opts.health_worker_id)
      .executeTakeFirst()
  },

  async getEmployed(
    trx: TrxOrDb,
    { health_worker_id }: { health_worker_id: string | IdSelection },
  ): Promise<EmployedHealthWorker> {
    const health_worker = await health_workers.getById(trx, health_worker_id)
    assert(health_workers.isEmployed(health_worker))
    return health_worker
  },
})
