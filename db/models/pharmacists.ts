import { InsertExpression } from 'kysely/parser/insert-values-parser.d.ts'
import { Maybe, Prefix, RenderedPharmacist, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom, jsonBuildObject, now } from '../helpers.ts'
import { sql } from 'kysely'
import { DB, PharmacistType } from '../../db.d.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import isString from '../../util/isString.ts'
import isBoolean from '../../util/isBoolean.ts'

export type PharmacistUpsert = {
  licence_number: string
  prefix: Prefix
  given_name: string
  family_name: string
  address: string
  town: string
  expiry_date: string
  pharmacist_type: PharmacistType
  pharmacy_id?: string
  is_supervisor?: boolean
}

export function isUpsert(
  obj: unknown,
): asserts obj is PharmacistUpsert {
  console.log('obj', obj)
  assertOr400(isObjectLike(obj))
  assertOr400(
    isString(obj.licence_number),
  )
  assertOr400(
    isString(obj.prefix),
  )
  assertOr400(
    isString(obj.given_name),
  )
  assertOr400(
    isString(obj.family_name),
  )
  assertOr400(
    isString(obj.address),
  )
  assertOr400(
    isString(obj.town),
  )
  assertOr400(
    isString(obj.expiry_date),
  )
  assertOr400(
    isString(obj.pharmacist_type),
  )
  if (obj.pharmacy_id) {
    assertOr400(isString(obj.pharmacy_id))
    assertOr400(isBoolean(obj.is_supervisor))
  }
}

export async function update(
  trx: TrxOrDb,
  pharmacist_id: string,
  data: PharmacistUpsert,
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
        is_supervisor: is_supervisor,
      })
      .execute()
  }
}

export function nameSql(table: string) {
  return sql<string>`concat(${sql.ref(`${table}.prefix`)}, '. ', ${
    sql.ref(`${table}.given_name`)
  }, ' ', ${
    sql.ref(
      `${table}.family_name`,
    )
  })`
}

export function addressDisplaySql(table: string) {
  return sql<string>`concat(${sql.ref(`${table}.address`)}, ', ', ${
    sql.ref(
      `${table}.town`,
    )
  })`
}

function getQuery(trx: TrxOrDb) {
  return trx
    .selectFrom('pharmacists')
    .select((eb) => [
      'pharmacists.id',
      'pharmacists.licence_number',
      'pharmacists.prefix',
      'pharmacists.given_name',
      'pharmacists.family_name',
      nameSql('pharmacists').as('name'),
      'pharmacists.address',
      'pharmacists.town',
      addressDisplaySql('pharmacists').as('address_display'),
      sql<string>`'/regulator/pharmacists/' || pharmacists.id`.as('href'),
      sql<string>`TO_CHAR(pharmacists.expiry_date, 'YYYY-MM-DD')`.as(
        'expiry_date',
      ),
      'pharmacists.pharmacist_type',
      jsonArrayFrom(
        eb.selectFrom('pharmacies')
          .innerJoin(
            'pharmacy_employment',
            'pharmacies.id',
            'pharmacy_employment.pharmacy_id',
          )
          .whereRef('pharmacy_employment.pharmacist_id', '=', 'pharmacists.id')
          .select([
            'pharmacies.id',
            'pharmacies.address',
            'pharmacies.town',
            'pharmacies.licence_number',
            'pharmacies.licensee',
            'pharmacies.name',
            'pharmacies.pharmacies_types',
            'pharmacy_employment.is_supervisor',
            addressDisplaySql('pharmacies').as('address_display'),
            sql<string>`TO_CHAR(pharmacies.expiry_date, 'YYYY-MM-DD')`.as(
              'expiry_date',
            ),
            sql<string>`'/regulator/pharmacies/' || pharmacies.id`.as('href'),
          ]),
      ).as('pharmacies'),
      jsonBuildObject({
        view: sql<string>`'/regulator/pharmacists/' || pharmacists.id`,
        revoke: sql<
          string
        >`'/regulator/pharmacists/' || pharmacists.id || '/revoke'`,
        edit: sql<
          string
        >`'/regulator/pharmacists/' || pharmacists.id || '/edit'`,
      }).as('actions'),
    ])
    .orderBy([
      'pharmacists.given_name asc',
      'pharmacists.family_name asc',
    ])
}

export async function get(
  trx: TrxOrDb,
  opts: {
    licence_number?: string
    name_search?: Maybe<string>
    pharmacist_type?: PharmacistType
    include_revoked?: boolean
    page?: number
    rowsPerPage?: number
  } = {},
) {
  const page = opts.page || 1
  const rowsPerPage = opts.rowsPerPage || 10
  const offset = (page - 1) * rowsPerPage
  let query = getQuery(trx)
    .limit(rowsPerPage)
    .offset(offset)

  if (!opts.include_revoked) {
    query = query.where(
      'pharmacists.revoked_at',
      'is',
      null,
    )
  }
  if (opts.name_search) {
    query = query.where(
      nameSql('pharmacists'),
      `ilike`,
      `%${opts.name_search}%`,
    )
  }
  if (opts.licence_number) {
    query = query.where(
      'pharmacists.licence_number',
      '=',
      opts.licence_number,
    )
  }
  if (opts.pharmacist_type) {
    query = query.where(
      'pharmacists.pharmacist_type',
      '=',
      opts.pharmacist_type,
    )
  }

  const pharmacists = await query.execute()

  const totalRowsResult = await trx
    .selectFrom('pharmacists')
    .select((eb) => eb.fn.count('id').as('totalRows'))
    .execute()

  const totalRows = parseInt(totalRowsResult[0].totalRows.toString(), 10)

  return {
    pharmacists,
    totalRows,
  }
}

export function getById(
  trx: TrxOrDb,
  pharmacist_id: string,
): Promise<RenderedPharmacist | undefined> {
  return getQuery(trx)
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

export function remove(trx: TrxOrDb, pharmacist_id: string) {
  return trx
    .deleteFrom('pharmacists')
    .where('id', '=', pharmacist_id)
    .execute()
}

export type PharmacistInsert = {
  licence_number: string
  prefix: Prefix
  given_name: string
  family_name: string
  address: string
  town: string
  expiry_date: string
  pharmacist_type: PharmacistType
  pharmacies
}

export async function insert(
  trx: TrxOrDb,
  data: PharmacistInsert
): Promise<{ id: string }> {
  const { pharmacies, ...pharmacistData } = data
  const pharmacist = await trx
    .insertInto('pharmacists')
    .values(pharmacistData)
    .returning('id')
    .executeTakeFirstOrThrow()
  if (!pharmacies) return pharmacist
  await trx
    .insertInto('pharmacy_employment')
    .values({
      pharmacist_id: pharmacist.id,
      pharmacy_id,
      is_supervisor,
    })
    .execute()
  return pharmacist
}
