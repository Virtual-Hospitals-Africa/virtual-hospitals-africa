import { Maybe, Prefix, RenderedPharmacist, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom, jsonBuildObject, now } from '../helpers.ts'
import { sql } from 'kysely'
import { PharmacistType } from '../../db.d.ts'
import { z } from 'zod'
import {
  insert as insertPharmacyEmployment,
  remove as removePharmacyEmployment,
  updateIsSupervisor,
} from './pharmacy_employment.ts'

export const PharmacistUpsert = z.object({
  licence_number: z.string(),
  prefix: z.enum(['Mr', 'Mrs', 'Ms', 'Miss', 'Dr']),
  given_name: z.string(),
  family_name: z.string(),
  address: z.string(),
  town: z.string(),
  expiry_date: z.string(),
  pharmacist_type: z.enum([
    'Dispensing Medical Practitioner',
    'Ind Clinic Nurse',
    'Pharmacist',
    'Pharmacy Technician',
  ]),
  pharmacies: z.optional(z.array(z.object({
    is_supervisor: z.boolean(),
    id: z.string(),
  }))),
})

export const parseUpsert = PharmacistUpsert.parse
export type PharmacistUpsert = z.infer<typeof PharmacistUpsert>

export async function update(
  trx: TrxOrDb,
  pharmacist_id: string,
  data: PharmacistUpsert,
) {
  let { pharmacies = [], ...pharmacistData } = data
  await trx
    .updateTable('pharmacists')
    .set(pharmacistData)
    .where('id', '=', pharmacist_id)
    .execute()
  const existingPharmacyEmployments = await trx
    .selectFrom('pharmacy_employment')
    .where('pharmacist_id', '=', pharmacist_id)
    .selectAll()
    .execute()
  for (const existingPharmacyEmployment of existingPharmacyEmployments) {
    const selectedPharmacy = pharmacies.find((pharmacy) =>
      pharmacy.id === existingPharmacyEmployment.pharmacy_id
    )
    if (selectedPharmacy) {
      await updateIsSupervisor(
        trx,
        pharmacist_id,
        existingPharmacyEmployment.pharmacy_id,
        selectedPharmacy.is_supervisor,
      )
    } else {
      await removePharmacyEmployment(
        trx,
        pharmacist_id,
        existingPharmacyEmployment.pharmacy_id,
      )
    }
    pharmacies = pharmacies.filter((pharmacy) =>
      pharmacy.id !== existingPharmacyEmployment.pharmacy_id
    )
  }
  const pharmacyEmployments = pharmacies.map((pharmacyEmployee) => ({
    pharmacist_id,
    pharmacy_id: pharmacyEmployee.id,
    is_supervisor: pharmacyEmployee.is_supervisor,
  }))
  if (!pharmacyEmployments.length) return
  await insertPharmacyEmployment(trx, pharmacyEmployments)
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

function baseQuery(trx: TrxOrDb) {
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

const isLicenceLike = (search: string) =>
  /^[A-Z]\d{2}-\d{4}-\d{4}$/.test(search.toUpperCase())

// TODO: search could be a search by licnese number or name
export async function search(
  trx: TrxOrDb,
  opts: {
    // licence_number?: string
    search?: Maybe<string>
    pharmacist_type?: PharmacistType
    include_revoked?: boolean
    page?: number
    rows_per_page?: number
  } = {},
) {
  const page = opts.page || 1
  const rows_per_page = opts.rows_per_page || 10
  const offset = (page - 1) * rows_per_page

  const name_search = (opts.search && !isLicenceLike(opts.search))
    ? opts.search
    : null
  const licence_number_search = (opts.search && isLicenceLike(opts.search))
    ? opts.search.toUpperCase()
    : null

  let query = baseQuery(trx)
    .limit(rows_per_page + 1)
    .offset(offset)

  if (!opts.include_revoked) {
    query = query.where(
      'pharmacists.revoked_at',
      'is',
      null,
    )
  }
  if (name_search) {
    query = query.where(
      nameSql('pharmacists'),
      `ilike`,
      `%${name_search}%`,
    )
  }
  if (licence_number_search) {
    query = query.where(
      'pharmacists.licence_number',
      '=',
      licence_number_search,
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

  return {
    results: pharmacists.slice(0, rows_per_page),
    has_next_page: pharmacists.length > rows_per_page,
    page,
    name_search,
    licence_number_search,
  }
}

export function getById(
  trx: TrxOrDb,
  pharmacist_id: string,
): Promise<RenderedPharmacist | undefined> {
  return baseQuery(trx)
    .where('pharmacists.id', '=', pharmacist_id)
    .executeTakeFirst()
}

export function getByLicenceNumber(
  trx: TrxOrDb,
  licence_number: string,
): Promise<RenderedPharmacist | undefined> {
  return baseQuery(trx)
    .where('pharmacists.licence_number', '=', licence_number)
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

type PharmacyEmploymentInsert = {
  is_supervisor: boolean
  id: string
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
  pharmacies?: PharmacyEmploymentInsert[]
}

export async function insert(
  trx: TrxOrDb,
  data: PharmacistInsert,
): Promise<{ id: string }> {
  const { pharmacies, ...pharmacistData } = data
  const pharmacist = await trx
    .insertInto('pharmacists')
    .values(pharmacistData)
    .returning('id')
    .executeTakeFirstOrThrow()
  if (!pharmacies) return pharmacist
  const pharmacyEmployments = pharmacies.map((pharmacyEmployee) => ({
    pharmacist_id: pharmacist.id,
    pharmacy_id: pharmacyEmployee.id,
    is_supervisor: pharmacyEmployee.is_supervisor,
  }))
  await insertPharmacyEmployment(trx, pharmacyEmployments)
  return pharmacist
}

export function getPharmacy(
  trx: TrxOrDb,
  pharmacist_id: string,
) {
  return trx
    .selectFrom('pharmacies')
    .innerJoin(
      'pharmacy_employment',
      'pharmacies.id',
      'pharmacy_employment.pharmacy_id',
    )
    .where('pharmacy_employment.pharmacist_id', '=', pharmacist_id)
    .select('licence_number')
    .select('name')
    .select('licensee')
    .select('address')
    .select('town')
    .select('expiry_date')
    .select('pharmacies_types')
    .executeTakeFirst()
}
