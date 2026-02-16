import type { RenderedCountryHealthWorker, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { base, identity } from './_base.ts'
import { health_worker_licences } from './health_worker_licences.ts'
import { health_workers_base, HealthWorkerSearch } from './health_workers_base.ts'
import { health_worker_organizations } from './health_worker_organizations.ts'
import { health_workers } from './health_workers.ts'
import { asNames } from '../../util/asNames.ts'

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
  async insert(
    trx: TrxOrDb,
    { licences, sex, gender, country, ...health_worker }: {
      first_names: string
      surname: string
      preferred_name: string
      date_of_birth: string
      sex: 'male' | 'female' | 'other' | 'prefer not to say'
      gender: string
      country: string
      licences: {
        profession: 'doctor' | 'nurse' | 'pharmacist' | 'receptionist'
        licence_number: string
        expiry_date: string
      }[]
    },
  ) {
    const names = asNames(health_worker)
    const health_worker_id = await health_workers.insertOne(trx, {
      ...health_worker,
      ...names,
    })
    await trx.insertInto('health_worker_licences')
      .values(
        licences.map((licence) => ({
          ...licence,
          sex,
          gender,
          country,
          health_worker_id,
          name: names.name,
        })),
      )
      .execute()
  },
})
