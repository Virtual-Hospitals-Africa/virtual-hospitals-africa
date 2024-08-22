import {
  Maybe,
  RenderedPharmacist,
  RenderedPharmacy,
  TrxOrDb,
} from '../../types.ts'
import { jsonBuildObject, now } from '../helpers.ts'
import { sql } from 'kysely'

export async function update(
  trx: TrxOrDb,
  pharmacist_id: string,
  data: RenderedPharmacist & { pharmacy_id?: string; is_supervisor?: boolean },
) {
  const { pharmacy_id, is_supervisor, ...pharmacistData } = data
  await trx
    .updateTable('pharmacists')
    .set(pharmacistData)
    .where('id', '=', pharmacist_id)
    .execute()

  const existingPharmacy = await trx
    .selectFrom('pharmacy_employment')
    .where('pharmacist_id', '=', pharmacist_id)
    .executeTakeFirst()

  const hasSelectedPharmacy = pharmacy_id !== undefined &&
    is_supervisor !== undefined

  if (!existingPharmacy && !hasSelectedPharmacy) return
  if (existingPharmacy && !hasSelectedPharmacy) {
    return await trx
      .deleteFrom('pharmacy_employment')
      .where('pharmacist_id', '=', pharmacist_id)
      .execute()
  }
  if (existingPharmacy && hasSelectedPharmacy) {
    return await trx
      .updateTable('pharmacy_employment')
      .set({
        pharmacy_id: pharmacy_id,
        is_supervisor: is_supervisor,
      })
      .where('pharmacist_id', '=', pharmacist_id)
      .execute()
  }
  if (!existingPharmacy && hasSelectedPharmacy) {
    await trx
      .insertInto('pharmacy_employment')
      .values({
        pharmacist_id,
        pharmacy_id: pharmacy_id,
        family_name: pharmacistData.family_name,
        given_name: pharmacistData.given_name,
        is_supervisor: is_supervisor,
        prefix: pharmacistData.prefix,
      })
      .execute()
  }
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

function pharmacists_with_pharmacy_sql(trx: TrxOrDb) {
  return trx
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
      'pharmacists.given_name',
      'pharmacists.family_name',
      name_sql('pharmacists').as('name'),
      'pharmacists.town',
      'pharmacists.address',
      address_town_sql('pharmacists').as('full_address'),
      'pharmacists.expiry_date',
      'pharmacists.pharmacist_type',
      'pharmacy_employment.is_supervisor',
      sql<RenderedPharmacy | undefined>`CASE
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
  const pharmacists = await pharmacists_with_pharmacy_sql(trx)
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

export function getById(trx: TrxOrDb, pharmacist_id: string) {
  return pharmacists_with_pharmacy_sql(trx)
    .where('pharmacists.id', '=', pharmacist_id)
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

export async function insert(
  trx: TrxOrDb,
  data: RenderedPharmacist & { pharmacy_id?: string; is_supervisor?: boolean },
): Promise<{ id: string }> {
  const { pharmacy_id, is_supervisor, ...pharmacistData } = data
  const pharmacist = await trx
    .insertInto('pharmacists')
    .values(pharmacistData)
    .returning('id')
    .executeTakeFirstOrThrow()
  if (pharmacy_id === undefined || is_supervisor === undefined) {
    return pharmacist
  }
  await trx
    .insertInto('pharmacy_employment')
    .values({
      pharmacist_id: pharmacist.id,
      pharmacy_id,
      family_name: data.family_name,
      given_name: data.given_name,
      is_supervisor,
      prefix: data.prefix,
    })
    .execute()
  return pharmacist
}
