import { sql } from 'kysely'
import { Coordinates, InsertRows, Maybe, RenderedOrganization, TrxOrDbOrQueryCreator } from '../../types.ts'
import { addresses, type AddressInsert } from './addresses.ts'
import { blankSelection, concat, jsonBuildNullableObject, jsonBuildObject, literalLocation, success_true } from '../helpers.ts'
import { base, identity, SearchResult } from './_base.ts'
import generateUUID from '../../util/uuid.ts'
import { Department } from '../../shared/departments.ts'
import { SERVER_COUNTRY } from './countries.ts'
import { assertArrayNonEmpty } from '../../util/arraySize.ts'

export type OrganizationSearch = {
  search?: string | null
  kind?: 'physical' | 'virtual' | null
  name?: string
  is_test?: boolean
  is_hospital?: boolean
  category?: string
  country?: string
  include_all_countries?: boolean
}
export type OrganizationInsert = {
  id?: string
  name: string
  country: string
  ownership?: Maybe<string>
  category?: Maybe<string>
  inactive_reason?: string
  address?: Maybe<AddressInsert>
  location?: Coordinates
  is_test?: boolean
  departments?: {
    name: Department
    room_names: string[]
  }[]
  most_common_language_code?: string
  licence_number?: Maybe<string>
  licensee?: Maybe<string>
  expiry_date?: Maybe<Date>
}

export const organizations = base({
  top_level_table: 'organizations',
  caching: {
    number_of_items: 100,
  },
  baseQuery(trx: TrxOrDbOrQueryCreator, opts: OrganizationSearch) {
    let qb = trx
      .selectFrom('organizations')
      .select((eb) => [
        'organizations.id',
        'organizations.name',
        'organizations.category',
        'organizations.is_test',
        'organizations.country',
        'organizations.ownership',
        'organizations.inactive_reason',
        'organizations.most_common_language_code',
        eb.selectFrom('addresses')
          .whereRef('addresses.id', '=', 'organizations.address_id')
          .select('addresses.formatted')
          .as('formatted_address'),
        eb.selectFrom('organization_rooms')
          .whereRef('organization_rooms.organization_id', '=', 'organizations.id')
          .where('organization_rooms.name', '=', 'Waiting room')
          .select('organization_rooms.id')
          .as('waiting_room_id'),
        eb.selectFrom('organization_rooms')
          .whereRef('organization_rooms.organization_id', '=', 'organizations.id')
          .where('organization_rooms.name', '=', 'Reception')
          .select('organization_rooms.id')
          .as('reception_id'),
        jsonBuildNullableObject(eb.ref('location'), {
          longitude: sql<number>`ST_X(location::geometry)`,
          latitude: sql<number>`ST_Y(location::geometry)`,
        }).as('location'),
        jsonBuildObject({
          regulator_view: concat('/regulator/organizations/', eb.ref('organizations.id')),
          health_worker_view: concat('/regulator/organizations/', eb.ref('organizations.id')),
        }).as('hrefs'),
      ])
    if (opts.search) {
      qb = qb.where('organizations.name', 'ilike', `%${opts.search}%`)
    }
    if (opts.name) {
      qb = qb.where('organizations.name', '=', opts.name)
    }
    if (opts.kind) {
      qb = qb.where(
        'address_id',
        opts.kind === 'physical' ? 'is not' : 'is',
        null,
      )
    }
    if (opts.is_test != null) {
      qb = qb.where('organizations.is_test', '=', opts.is_test)
    }
    if (!opts.include_all_countries) {
      qb = qb.where('organizations.country', '=', SERVER_COUNTRY)
    }
    if (opts.category) {
      qb = qb.where('organizations.category', '=', opts.category)
    }
    if (opts.country) {
      qb = qb.where('organizations.country', '=', opts.country)
    }
    if (opts.is_hospital) {
      qb = qb.where('organizations.category', 'in', HOSPITAL_CATEGORIES)
    }
    return qb
  },
  formatResult: identity<RenderedOrganization>,
  async addDepartments(
    trx: TrxOrDbOrQueryCreator,
    organization_id: string,
    departments: {
      name: Department
      room_names: string[]
    }[],
  ) {
    if (!departments.length) return

    const departments_insert: InsertRows<'organization_departments'> = []
    const organization_rooms_insert: InsertRows<'organization_rooms'> = []
    const organization_department_rooms_insert: InsertRows<'organization_department_rooms'> = []

    for (const dept of departments) {
      const organization_department_id = generateUUID()
      departments_insert.push({
        id: organization_department_id,
        organization_id,
        name: dept.name,
      })

      assertArrayNonEmpty(dept.room_names)

      for (const room_name of dept.room_names) {
        const organization_room_id = generateUUID()
        organization_rooms_insert.push({
          id: organization_room_id,
          organization_id,
          name: room_name,
        })
        organization_department_rooms_insert.push({
          organization_room_id,
          organization_department_id,
        })
      }
    }

    await trx.with(
      'inserting_departments',
      (qb) =>
        qb.insertInto('organization_departments')
          .values(departments_insert),
    ).with('inserting_rooms', (qb) =>
      qb.insertInto('organization_rooms')
        .values(organization_rooms_insert)).with(
        'inserting_department_rooms',
        (qb) =>
          qb.insertInto('organization_department_rooms')
            .values(organization_department_rooms_insert),
      ).selectNoFrom([
        success_true,
      ]).executeTakeFirstOrThrow()
  },
  async add(
    trx: TrxOrDbOrQueryCreator,
    {
      id,
      address,
      location,
      departments,
      ...rest
    }: OrganizationInsert,
  ) {
    const organization_id = id || generateUUID()
    const address_id: string | undefined = address ? (address.id || generateUUID()) : undefined

    await trx.with(
      'inserting_address',
      (qb) =>
        address
          ? qb.insertInto('addresses')
            .values(addresses.insertValues({
              ...address,
              id: address_id,
            }))
          : blankSelection(qb),
    ).with('inserting_organization', (qb) =>
      qb.insertInto('organizations')
        .values({
          ...rest,
          id: organization_id,
          address_id,
          location: location && literalLocation(location),
        }))
      .selectNoFrom(success_true)
      .executeTakeFirstOrThrow()

    if (departments?.length) {
      await organizations.addDepartments(trx, organization_id, departments)
    }

    return { id: organization_id, address_id, location }
  },
})

export type OrganizationSearchResult = SearchResult<typeof organizations>

export const HOSPITAL_CATEGORIES = [
  'Refferal Hospital',
  'District Hospital',
  'Community Hospital',
  'University Teaching Hospital',
  'State Hospital',
  'Level 1 Hospital',
  'Zonal Hospital',
  'Teaching Hospital',
  'Centre Hospitalier Universitaire National',
  'Centre National Hospitalier Universitaire',
  'Type D Hospital',
  'National Referral Hospital',
  'Type A Hospital',
  'Intermediate Hospital',
  'General Hospital Hospital',
  'Rural Hospital',
  'National Hospital',
  'Natonal Hospital',
  'Hospital Medical Center',
  'Tertiary Hospital',
  'Provincial Hospital',
  'Centre Hospitalier R├®gional',
  'Primary Hospital',
  'Mission Hospital',
  'Central Hospital',
  'Referral Hospital',
  'Hospitalier R├®gional',
  'Level 2 Hospital',
  'Centre Hospitalier D├®partemental',
  'National Central Hospital',
  'Hospital Geral',
  'General Hospital',
  'Cottage Hospital',
  'Hospital Provincial',
  'Centre Hospitalier Universitaire',
  'Hospital Rural',
  'Regional Referral Hospital',
  'University Hospital',
  'Provincial Tertiary Hospital',
  'Hospital Central',
  'Sub-district Hospital',
  'Designated District Hospital',
  'Municipal Hospital',
  'Regional Hospital',
  'County Hospital',
  'Hospital Medical Centre',
  'Centre Hospitalier Pr├®fectoral',
  'Type C Hospital',
  'Provincial General Hospital',
  'County Referral Hospital',
  'Centre Hospitalier Urbain',
  'Hospitalier Universitaire',
  'Type B Hospital',
  'Hospital Distrital',
  'District/provincial Hospital',
  'Level 3 Hospital',
  'Mini Hospital',
  'Hospital',
  'Centre Hospitalier National',
]
