import type { Profession } from '../../db.d.ts'
import type { Maybe, RenderedLicence, TrxOrDb } from '../../types.ts'
import { jsonObjectFrom, now } from '../helpers.ts'
import { base, identity } from './_base.ts'
import { addresses } from './addresses.ts'

export const health_worker_licences = base({
  top_level_table: 'health_worker_licences',
  baseQuery(
    trx: TrxOrDb,
    opts: {
      country?: string
      licence_number?: Maybe<string>
      status: 'all' | 'active' | 'revoked' | 'expired'
      profession?: Profession
    },
  ) {
    const qb = trx
      .selectFrom('health_worker_licences')
      .leftJoin('health_worker_licence_revocations', 'health_worker_licences.id', 'health_worker_licence_revocations.health_worker_license_id')
      .selectAll('health_worker_licences')
      .select((eb) => [
        'revoked_at',
        'revoked_by',
        jsonObjectFrom(
          addresses.baseQuery(trx)
            .where('addresses.id', '=', eb.ref('address_id')),
        ).$notNull().as('address'),
        eb.case()
          .when('revoked_at', 'is not', null)
          .then('revoked' as const)
          .when('expiry_date', '>', now)
          .then('expired' as const)
          .else('active' as const)
          .end()
          .as('status'),
      ])
      .$if(!!opts.country, (qb) => qb.where('country', '=', opts.country!))
      .$if(!!opts.licence_number, (qb) => qb.where('licence_number', '=', opts.licence_number!.toUpperCase()))

    return applyStatusFilter(qb)

    function applyStatusFilter(query: typeof qb) {
      switch (opts.status) {
        case 'all':
          return query
        case 'expired':
          return qb.where('expiry_date', '>', now)
        case 'revoked':
          return qb.where('revoked_at', 'is not', null)
        case 'active':
          return qb.where('revoked_at', 'is', null).where((eb) =>
            eb.or([
              eb('expiry_date', 'is', null),
              eb('expiry_date', '<=', now),
            ])
          )
      }
    }
  },
  formatResult: identity<RenderedLicence>,
})
