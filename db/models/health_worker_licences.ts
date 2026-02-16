import type { Profession } from '../../db.d.ts'
import type { Maybe, RenderedLicence, TrxOrDb } from '../../types.ts'
import { jsonObjectFrom, literalString, now } from '../helpers.ts'
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
      health_worker_id?: string
    },
  ) {
    const qb = trx
      .selectFrom('health_worker_licences')
      .leftJoin('health_worker_licence_revocations', 'health_worker_licences.id', 'health_worker_licence_revocations.health_worker_licence_id')
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
      .$if(!!opts.profession, (qb) => qb.where('profession', '=', opts.profession!))
      .$if(!!opts.health_worker_id, (qb) => qb.where('health_worker_id', '=', opts.health_worker_id!))
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
  revoke(
    trx: TrxOrDb,
    { revoked_by, ...licence }: {
      health_worker_id: string
      profession: Profession
      country: string
      revoked_by: string
    },
  ) {
    return trx.insertInto('health_worker_licence_revocations')
      .columns([
        'health_worker_licence_id',
        'revoked_by',
      ])
      .expression(() =>
        health_worker_licences.baseQuery(trx, { ...licence, status: 'active' })
          .clearSelect()
          .select([
            'id as health_worker_licence_id',
            literalString(revoked_by).as('revoked_by'),
          ])
      )
      .execute()
  },
})
