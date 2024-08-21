import {
  Maybe,
  RenderedPharmacist,
  RenderedPharmacy,
  TrxOrDb,
} from '../../types.ts'
import { jsonBuildObject, now } from '../helpers.ts'
import { sql } from 'kysely'

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
      'pharmacy_employment',
      'pharmacists.id',
      'pharmacy_employment.pharmacist_id',
    )
    .leftJoin('pharmacies', 'pharmacy_employment.pharmacy_id', 'pharmacies.id')
    .select((eb) => [
      'pharmacists.id',
      'pharmacists.licence_number',
      'pharmacists.prefix',
      name_sql('pharmacists').as('name'),
      address_town_sql('pharmacists').as('address'),
      'pharmacists.expiry_date',
      'pharmacists.pharmacist_type',
      sql`CASE
        WHEN pharmacies.id IS NOT NULL THEN ${
        jsonBuildObject({
          id: eb.ref('pharmacies.id'),
          address: eb.ref('pharmacies.address'),
          expiry_date: sql<
            string
          >`TO_CHAR(pharmacies.expiry_date, 'YYYY-MM-DD')`,
          licence_number: eb.ref('pharmacies.licence_number'),
          licensee: eb.ref('pharmacies.licensee'),
          name: eb.ref('pharmacies.name'),
          pharmacies_types: eb.ref('pharmacies.pharmacies_types'),
          town: eb.ref('pharmacies.town'),
          href: sql<string>`'/regulator/pharmacies/' || pharmacies.id`,
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
      view: `/regulator/pharmacists/${pharmacist.id}`,
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

export function getByName(trx: TrxOrDb, name:string){
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
  .where(sql`concat(given_name, ' ', family_name)`, '=', name)
  .executeTakeFirst()
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
    regulator_id: string
  },
) {
  return trx.updateTable('pharmacists').set({
    revoked_at: now,
    revoked_by: data.regulator_id,
  }).where('id', '=', data.pharmacist_id).execute()
}

export async function getAllWithSearchConditions(
  trx: TrxOrDb,
  search?: Maybe<string>,
): Promise<RenderedPharmacist[]> {
  let query = trx
    .selectFrom('pharmacists')
    .select([
      'id',
      'licence_number',
      'prefix',
      'given_name',
      'family_name',
      name_sql('pharmacists').as('name'),
      'address',
      'town',
      'expiry_date',
      'pharmacist_type',
    ])
    .where('pharmacists.given_name', 'is not', null).limit(30)
  if (search) {
    query = query.where(
      sql`concat(given_name, ' ', family_name)`,
      `ilike`,
      `%${search}%`,
    ).orderBy('pharmacists.given_name', 'asc')
    query = query.where(
      sql`concat(given_name, ' ', family_name)`,
      'ilike',
      `%${search}%`,
    ).orderBy('pharmacists.given_name', 'asc')
  }
  const pharmacists = await query.execute()
  const renderedPharmacists: RenderedPharmacist[] = pharmacists.map(
    (pharmacist) => ({
      id: pharmacist.id,
      given_name: pharmacist.given_name,
      name: pharmacist.name,
      licence_number: pharmacist.licence_number,
      prefix: pharmacist.prefix,
      family_name: pharmacist.family_name,
      address: pharmacist.address,
      town: pharmacist.town,
      pharmacist_type: pharmacist.pharmacist_type,
      expiry_date: pharmacist.expiry_date.toDateString(),
    }),
  )
  return renderedPharmacists
}

export function remove(trx: TrxOrDb, pharmacist_id: string) {
  return trx
    .deleteFrom('pharmacists')
    .where('id', '=', pharmacist_id)
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
