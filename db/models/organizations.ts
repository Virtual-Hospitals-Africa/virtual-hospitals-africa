import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import {
  Coordinates,
  InsertShape,
  Maybe,
  NonEmptyArray,
  RenderedOrganization,
  TrxOrDb,
} from '../../types.ts'
import * as addresses from './addresses.ts'
import {
  blankSelection,
  jsonArrayFrom,
  jsonBuildNullableObject,
  literalLocation,
  orderByArrayPosition,
  success_true,
} from '../helpers.ts'
import { base, SearchResult } from './_base.ts'
import generateUUID from '../../util/uuid.ts'
import { Department, DEPARTMENTS } from '../../shared/departments.ts'
import { SERVER_COUNTRY } from './countries.ts'
import { DB } from '../../db.d.ts'
import { assertArrayNonEmpty } from '../../util/arraySize.ts'

export function baseQuery(trx: TrxOrDb) {
  return trx
    .selectFrom('organizations')
    .leftJoin('addresses', 'organizations.address_id', 'addresses.id')
    .leftJoin(
      'organization_rooms as waiting_rooms',
      (join) =>
        join.onRef('waiting_rooms.organization_id', '=', 'organizations.id')
          .on('waiting_rooms.name', '=', 'Waiting room'),
    )
    .leftJoin(
      'organization_rooms as receptions',
      (join) =>
        join.onRef('receptions.organization_id', '=', 'organizations.id')
          .on('receptions.name', '=', 'Reception'),
    )
    .select((eb) => [
      'organizations.id',
      'organizations.name',
      'organizations.category',
      'organizations.is_test',
      'organizations.country',
      'organizations.ownership',
      'organizations.inactive_reason',
      'organizations.most_common_language_code',
      'addresses.formatted as formatted_address',
      'addresses.formatted as description',
      'waiting_rooms.id as waiting_room_id',
      'receptions.id as reception_id',
      jsonBuildNullableObject(eb.ref('location'), {
        longitude: sql<number>`ST_X(location::geometry)`,
        latitude: sql<number>`ST_Y(location::geometry)`,
      }).as('location'),
      jsonArrayFrom(
        eb.selectFrom('organization_departments')
          .innerJoin(
            'departments',
            'departments.name',
            'organization_departments.name',
          )
          .select([
            'organization_departments.id',
            'organization_departments.name',
            'departments.requires_triage',
            'departments.workflows',
          ])
          .whereRef(
            'organization_departments.organization_id',
            '=',
            'organizations.id',
          ).orderBy(
            (eb_organization_departments_order) =>
              orderByArrayPosition(
                eb_organization_departments_order,
                'organization_departments.name',
                DEPARTMENTS as NonEmptyArray<string>,
              ),
            'desc',
          ),
      ).as('departments'),
    ])
}

const model = base({
  top_level_table: 'organizations',
  baseQuery,
  formatResult: (x): RenderedOrganization => x,
  handleSearch(
    qb,
    opts: {
      search?: string | null
      kind?: 'physical' | 'virtual' | null
      is_test?: boolean
      category?: string
      country?: string
      include_all_countries?: boolean
    },
  ) {
    if (opts.search) {
      qb = qb.where('organizations.name', 'ilike', `%${opts.search}%`)
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
    return qb
  },
})

export const search = model.search
export const getById = model.getById
export const getByIds = model.getByIds

export type OrganizationSearchResult = SearchResult<typeof model>

export type OrganizationInsert = {
  id?: string
  name: string
  country: string
  ownership?: Maybe<string>
  category?: Maybe<string>
  inactive_reason?: string
  address?: Maybe<addresses.AddressInsert>
  location?: Coordinates
  is_test?: boolean
  departments?: {
    name: Department
    room_names: string[]
  }[]
  most_common_language_code?: string
}

export async function addDepartments(
  trx: TrxOrDb,
  organization_id: string,
  departments: {
    name: Department
    room_names: string[]
  }[],
) {
  if (!departments.length) return

  const departments_insert: InsertShape<DB['organization_departments']>[] = []
  const organization_rooms_insert: InsertShape<DB['organization_rooms']>[] = []
  const organization_department_rooms_insert: InsertShape<
    DB['organization_department_rooms']
  >[] = []

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
}

export async function add(
  trx: TrxOrDb,
  {
    id,
    address,
    location,
    departments,
    ...rest
  }: OrganizationInsert,
) {
  const organization_id = id || generateUUID()
  const address_id: string | undefined = address
    ? (address.id || generateUUID())
    : undefined

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
    await addDepartments(trx, organization_id, departments)
  }

  return { id: organization_id, address_id }
}

export function remove(
  trx: TrxOrDb,
  opts: {
    id: string
  },
) {
  assert(Deno.env.get('IS_TEST'), 'Only allowed in test mode for now')
  return trx.deleteFrom('organizations').where('id', '=', opts.id).execute()
}
