import { DOCTOR_LICENCES } from '../../shared/regulatory_agencies.ts'
import type { Maybe, RenderedLicence, TrxOrDb } from '../../types.ts'
import { jsonBuildNullableObject, jsonBuildObject, literalString, now } from '../helpers.ts'
import { base, identity } from './_base.ts'

export const health_worker_licences = base({
  top_level_table: 'health_worker_licences',
  baseQuery(
    trx: TrxOrDb,
    opts: {
      country?: string
      regulatory_agency_acronym?: string
      licence_number?: Maybe<string>
      status: 'all' | 'active' | 'revoked' | 'expired'
      profession?: string
      health_worker_id?: string
      doctor?: boolean
    },
  ) {
    const qb = trx
      .selectFrom('health_worker_licences')
      .innerJoin('health_worker_licence_numbers', 'health_worker_licence_number_id', 'health_worker_licence_numbers.id')
      .innerJoin('regulatory_agencies', 'regulatory_agency_id', 'regulatory_agencies.id')
      .leftJoin('health_worker_licence_revocations', 'health_worker_licences.id', 'health_worker_licence_revocations.health_worker_licence_id')
      .selectAll('health_worker_licences')
      .select((eb) => [
        'licence_number',
        jsonBuildNullableObject(
          eb.ref('health_worker_licence_revocations.reason'),
          {
            at: eb.ref('revoked_at').$notNull(),
            by: eb.ref('revoked_by').$notNull(),
            reason: eb.ref('health_worker_licence_revocations.reason').$notNull(),
          },
        ).as('revoked'),
        jsonBuildObject({
          name: eb.ref('regulatory_agencies.name'),
          acronym: eb.ref('regulatory_agencies.acronym'),
          country: eb.ref('regulatory_agencies.country'),
        }).as('regulatory_agency'),
        eb.case()
          .when('health_worker_licence_revocations.reason', 'is not', null)
          .then('revoked' as const)
          .when('expiry_date', '>', now)
          .then('expired' as const)
          .else('active' as const)
          .end()
          .as('status'),
      ])
      .$if(!!opts.country, (qb) => qb.where('country', '=', opts.country!))
      .$if(!!opts.regulatory_agency_acronym, (qb) => qb.where('acronym', '=', opts.regulatory_agency_acronym!))
      .$if(!!opts.role, (qb) => qb.where('profession', '=', opts.role!))
      .$if(!!opts.health_worker_id, (qb) => qb.where('health_worker_licence_numbers.health_worker_id', '=', opts.health_worker_id!))
      .$if(!!opts.licence_number, (qb) => qb.where('licence_number', '=', opts.licence_number!.toUpperCase()))
      .$if(!!opts.doctor, (qb) =>
        qb.where((eb) =>
          eb.or(DOCTOR_LICENCES.map(({ country, agency_acronym, register }) =>
            eb.and([
              eb('regulatory_agencies.country', '=', country),
              eb('regulatory_agencies.acronym', '=', agency_acronym),
              eb('health_worker_licences.role', '=', register),
            ])
          ))
        ))

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
      profession: string
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
