/// <reference path="../pharmacy-db-augment.d.ts" />
import { Maybe, Prefix, RenderedPharmacist, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom, jsonBuildObject, now } from '../helpers.ts'
import { sql } from 'kysely'
import { PharmacistType } from '../../db.d.ts'
import { z } from 'zod'
import { pharmacy_employment } from './pharmacy_employment.ts'
import { base } from './_base.ts'

export const PharmacistUpsertSchema = z.object({
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

export type PharmacistUpsert = z.infer<typeof PharmacistUpsertSchema>

export function nameSql(table: string) {
  return sql<string>`concat(${sql.ref(`${table}.prefix`)}, '. ', ${sql.ref(`${table}.given_name`)}, ' ', ${
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
  return (trx as any)
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
      'pharmacists.country',
      addressDisplaySql('pharmacists').as('address_display'),
      sql<
        string
      >`'/regulator/' || pharmacists.country || '/pharmacists/' || pharmacists.id`
        .as('href'),
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
            'pharmacies.country',
            'pharmacies.pharmacies_types',
            'pharmacy_employment.is_supervisor',
            addressDisplaySql('pharmacies').as('address_display'),
            sql<string>`TO_CHAR(pharmacies.expiry_date, 'YYYY-MM-DD')`.as(
              'expiry_date',
            ),
            sql<
              string
            >`'/regulator/' || pharmacies.country || '/pharmacies/' || pharmacies.id`
              .as('href'),
          ]),
      ).as('pharmacies'),
      jsonBuildObject({
        view: sql<
          string
        >`'/regulator/' || pharmacists.country || '/pharmacists/' || pharmacists.id`,
        revoke: sql<
          string
        >`'/regulator/' || pharmacists.country || '/pharmacists/' || pharmacists.id || '/revoke'`,
        edit: sql<
          string
        >`'/regulator/' || pharmacists.country || '/pharmacists/' || pharmacists.id || '/edit'`,
      }).as('actions'),
    ])
    .orderBy('pharmacists.given_name', 'asc')
    .orderBy('pharmacists.family_name', 'asc')
}

const isLicenceLike = (search: string) => /^[A-Z]\d{2}-\d{4}-\d{4}$/.test(search.toUpperCase())

type SearchTerms = {
  country?: Maybe<string>
  name_search: string | null
  licence_number_search: string | null
  pharmacist_type?: PharmacistType
  include_revoked?: boolean
}

function toSearchTerms(
  country: string,
  search: string | null,
): SearchTerms {
  if (!search) {
    return { country, name_search: null, licence_number_search: null }
  }
  if (isLicenceLike(search)) {
    return {
      country,
      name_search: null,
      licence_number_search: search.toUpperCase(),
    }
  }
  return { country, name_search: search, licence_number_search: null }
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
  country: string
  pharmacies?: PharmacyEmploymentInsert[]
}

export const pharmacists = base({
  top_level_table: 'pharmacists',
  baseQuery,
  formatResult: (x: RenderedPharmacist): RenderedPharmacist => x,
  handleSearch(qb, opts: SearchTerms) {
    if (!opts.include_revoked) {
      qb = qb.where(
        'pharmacists.revoked_at',
        'is',
        null,
      )
    }
    if (opts.name_search) {
      qb = qb.where(
        nameSql('pharmacists'),
        `ilike`,
        `%${opts.name_search}%`,
      )
    }
    if (opts.licence_number_search) {
      qb = qb.where(
        'pharmacists.licence_number',
        '=',
        opts.licence_number_search,
      )
    }
    if (opts.pharmacist_type) {
      qb = qb.where(
        'pharmacists.pharmacist_type',
        '=',
        opts.pharmacist_type,
      )
    }
    if (opts.country) {
      qb = qb.where('pharmacists.country', '=', opts.country)
    }
    return qb
  },
  toSearchTerms,
  async update(
    trx: TrxOrDb,
    pharmacist_id: string,
    data: PharmacistUpsert,
  ) {
    let { pharmacies = [], ...pharmacistData } = data
    await (trx as any)
      .updateTable('pharmacists')
      .set(pharmacistData)
      .where('id', '=', pharmacist_id)
      .execute()
    const existing_pharmacy_employments = await (trx as any)
      .selectFrom('pharmacy_employment')
      .where('pharmacist_id', '=', pharmacist_id)
      .selectAll()
      .execute()
    for (const existing_pharmacy_employment of existing_pharmacy_employments) {
      const selected_pharmacy = pharmacies.find((pharmacy) => pharmacy.id === existing_pharmacy_employment.pharmacy_id)
      if (selected_pharmacy) {
        await pharmacy_employment.updateIsSupervisor(
          trx,
          pharmacist_id,
          existing_pharmacy_employment.pharmacy_id,
          selected_pharmacy.is_supervisor,
        )
      } else {
        await pharmacy_employment.remove(
          trx,
          pharmacist_id,
          existing_pharmacy_employment.pharmacy_id,
        )
      }
      pharmacies = pharmacies.filter((pharmacy) => pharmacy.id !== existing_pharmacy_employment.pharmacy_id)
    }
    const pharmacy_employments = pharmacies.map((pharmacy_employee) => ({
      pharmacist_id,
      pharmacy_id: pharmacy_employee.id,
      is_supervisor: pharmacy_employee.is_supervisor,
    }))
    if (!pharmacy_employments.length) return
    await pharmacy_employment.insert(trx, pharmacy_employments)
  },
  getByLicenceNumber(
    trx: TrxOrDb,
    licence_number: string,
  ): Promise<RenderedPharmacist | undefined> {
    return baseQuery(trx)
      .where('pharmacists.licence_number', '=', licence_number)
      .executeTakeFirst()
  },
  revoke(
    trx: TrxOrDb,
    data: {
      pharmacist_id: string
      regulator_id: string
    },
  ) {
    return (trx as any).updateTable('pharmacists').set({
      revoked_at: now,
      revoked_by: data.regulator_id,
    }).where('id', '=', data.pharmacist_id).execute()
  },
  remove(trx: TrxOrDb, pharmacist_id: string) {
    return (trx as any)
      .deleteFrom('pharmacists')
      .where('id', '=', pharmacist_id)
      .execute()
  },
  async insert(
    trx: TrxOrDb,
    data: PharmacistInsert,
  ): Promise<{ id: string }> {
    const { pharmacies, ...pharmacistData } = data
    const pharmacist = await (trx as any)
      .insertInto('pharmacists')
      .values(pharmacistData)
      .returning('id')
      .executeTakeFirstOrThrow()
    if (!pharmacies) return pharmacist
    const pharmacy_employments = pharmacies.map((pharmacyEmployee) => ({
      pharmacist_id: pharmacist.id,
      pharmacy_id: pharmacyEmployee.id,
      is_supervisor: pharmacyEmployee.is_supervisor,
    }))
    await pharmacy_employment.insert(trx, pharmacy_employments)
    return pharmacist
  },
})
