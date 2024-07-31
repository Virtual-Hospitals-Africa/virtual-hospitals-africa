import {  Maybe, RenderedPharmacist, RenderedPharmacy, TrxOrDb } from '../../types.ts'
import { jsonBuildObject, now } from '../helpers.ts'
import { sql } from 'kysely'



export function update(
  trx: TrxOrDb,
  pharmacist_id: string,
  data: {
    licence_number?: string
    pin?: string | null
  },
) {
  return trx.updateTable('pharmacists').set(data).where(
    'id',
    '=',
    pharmacist_id,
  ).execute()
}

export function name_sql(table: string) {
  return sql<string>`concat(${sql.ref(`${table}.given_name`)}, ' ', ${
    sql.ref(
      `${table}.family_name`,
    )
  })`
}

export function address_town_sql(table: string) {
  return sql<string>`concat(${sql.ref(`${table}.address`)}, ', ', ${
    sql.ref(
      `${table}.town`,
    )
  })`
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
  page: number = 1,
  rowsPerPage: number = 10,
) {
  const offset = (page - 1) * rowsPerPage
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
      name_sql('pharmacists').as('name'),
      address_town_sql('pharmacists').as('address'),
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
    .limit(rowsPerPage)
    .offset(offset)
    .execute()

  const totalRowsResult = await trx
    .selectFrom('pharmacists')
    .select((eb) => eb.fn.count('id').as('totalRows'))
    .execute()

  const totalRows = parseInt(totalRowsResult[0].totalRows.toString(), 10)

  const pharmacistsList = pharmacists.map((pharmacist) => ({
    ...pharmacist,
    expiry_date: new Date(pharmacist.expiry_date).toISOString().split('T')[0],
    actions: {
      revoke: `/regulator/pharmacists/${pharmacist.id}/revoke`,
      edit: `/regulator/pharmacists/${pharmacist.id}/edit`,
    },
    pharmacy: (pharmacist.pharmacy as RenderedPharmacy) ?? undefined,
  }))
  return {
    pharmacistsList,
    totalRows,
  }
}


export function getById(trx: TrxOrDb, pharmacist_id: string) {
  return trx.selectFrom('pharmacists')
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
  return trx.updateTable('pharmacists').set({
    revoked_at: now,
    revoked_by: data.regulator_id,
  }).where('id', '=', data.pharmacist_id).execute()
}

const baseSelect = (trx: TrxOrDb) =>
  trx
    .selectFrom('pharmacists')
    .select((eb) => [
      eb.ref('pharmacists.given_name').$notNull().as('given_name'),
    ])
  
    


export async function getAllWithSearchConditions(
  trx: TrxOrDb,
  search?: Maybe<string>,
): Promise<RenderedPharmacist[]> {
  let query = trx.selectFrom('pharmacists')
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
  ]).where('pharmacists.given_name', 'is not', null);
  if (search) {
    query = query.where(sql`concat(given_name, ' ', family_name)`, `ilike`, `%${search}%`).orderBy('pharmacists.given_name','asc').limit(30)
    query = query.where(sql`concat(given_name, ' ', family_name)`, 'ilike', `%${search}%`).orderBy('pharmacists.given_name','asc').limit(30)
  }
  const pharmacists = await query.execute()
  const renderedPharmacists: RenderedPharmacist[] = pharmacists.map(pharmacist => ({
    id: pharmacist.id,
    given_name: pharmacist.given_name,
    licence_number: pharmacist.licence_number,
    prefix: pharmacist.prefix,
    family_name: pharmacist.family_name,
    address: pharmacist.address,
    town: pharmacist.town,
    pharmacist_type: pharmacist.pharmacist_type,
    expiry_date: pharmacist.expiry_date
  }));
  return renderedPharmacists
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
  
