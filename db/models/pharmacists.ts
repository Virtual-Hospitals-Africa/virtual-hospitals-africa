import { sql } from 'kysely'
import { RenderedPharmacist, RenderedPharmacy, TrxOrDb } from '../../types.ts'
import { jsonBuildObject, now } from '../helpers.ts'

export function update(
  trx: TrxOrDb,
  pharmacist_id: string,
  data: RenderedPharmacist,
) {
  return trx
    .updateTable('pharmacists')
    .set(data)
    .where('id', '=', pharmacist_id)
    .execute()
}

export async function get(
  trx: TrxOrDb,
  query: {
    licence_number?: string
    given_name?: string
    family_name?: string
    pharmacist_type?: string
    include_revoked?: boolean
  } = {},
) {
  const pharmacists = await trx
    .selectFrom('pharmacists')
    .leftJoin(
      'premise_supervisors',
      'pharmacists.id',
      'premise_supervisors.pharmacist_id',
    )
    .leftJoin('premises', 'premise_supervisors.premise_id', 'premises.id')
    .select((eb) => [
      'pharmacists.id',
      'pharmacists.licence_number',
      'pharmacists.prefix',
      'pharmacists.given_name',
      'pharmacists.family_name',
      'pharmacists.address',
      'pharmacists.town',
      'pharmacists.expiry_date',
      'pharmacists.pharmacist_type',
      sql`CASE
        WHEN premises.id IS NOT NULL THEN ${
        jsonBuildObject({
          id: eb.ref('premises.id'),
          address: eb.ref('premises.address'),
          expiry_date: sql<string>`TO_CHAR(premises.expiry_date, 'YYYY-MM-DD')`,
          licence_number: eb.ref('premises.licence_number'),
          licensee: eb.ref('premises.licensee'),
          name: eb.ref('premises.name'),
          premises_types: eb.ref('premises.premises_types'),
          town: eb.ref('premises.town'),
          href: sql<string>`'/regulator/pharmacies/' || premises.id`,
        })
      }
        ELSE NULL
      END`.as('pharmacy'),
    ])
    .where(
      'pharmacists.revoked_at',
      query.include_revoked ? 'is not' : 'is',
      null,
    )
    .orderBy('pharmacists.given_name', 'asc')
    .orderBy('pharmacists.family_name', 'asc')
    .limit(50)
    .execute()

  return pharmacists.map((pharmacist) => ({
    ...pharmacist,
    expiry_date: new Date(pharmacist.expiry_date).toISOString().split('T')[0],
    actions: {
      revoke: `/regulator/pharmacists/${pharmacist.id}/revoke`,
      edit: `/regulator/pharmacists/${pharmacist.id}/edit`,
    },
    pharmacy: (pharmacist.pharmacy as RenderedPharmacy) ?? undefined,
  }))
}

export function getById(trx: TrxOrDb, pharmacist_id: string) {
  return trx
    .selectFrom('pharmacists')
    .select([
      'id',
      'licence_number',
      'prefix',
      'given_name',
      'family_name',
      'address',
      'town',
      'expiry_date',
      'pharmacist_type',
    ])
    .where('id', '=', pharmacist_id)
    .executeTakeFirst()
}

export function revoke(
  trx: TrxOrDb,
  data: {
    pharmacist_id: string
    regulator_id: number
  },
) {
  return trx
    .updateTable('pharmacists')
    .set({
      revoked_at: now,
      revoked_by: data.regulator_id,
    })
    .where('id', '=', data.pharmacist_id)
    .execute()
}

export function insert(
  trx: TrxOrDb,
  data: RenderedPharmacist,
): Promise<{ id: string }> {
  return trx
    .insertInto('pharmacists')
    .values(data)
    .returning('id')
    .executeTakeFirstOrThrow()
}
