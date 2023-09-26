import { sql } from 'kysely'
import { assert } from 'std/testing/asserts.ts'
import {
  Facility,
  Location,
  Maybe,
  Profession,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import haveNames from '../../util/haveNames.ts'

export async function nearest(
  trx: TrxOrDb,
  location: Location,
): Promise<ReturnedSqlRow<Facility>[]> {
  const result = await sql<ReturnedSqlRow<Facility>>`
      SELECT *,
             ST_Distance(
                  location,
                  ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography
              ) AS distance,
              ST_X(location::geometry) as longitude,
              ST_Y(location::geometry) as latitude
        FROM facilities
    ORDER BY location <-> ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography
       LIMIT 10
  `.execute(trx)

  return result.rows
}

export async function getAllWithNames(
  trx: TrxOrDb,
  search?: Maybe<string>,
): Promise<ReturnedSqlRow<Facility>[]> {
  let query = trx
    .selectFrom('facilities')
    .selectAll()
    .where('name', 'is not', null)

  if (search) query = query.where('name', 'ilike', `%${search}%`)

  const facilities = await query.execute()

  assert(haveNames(facilities))

  return facilities
}

export function get(
  trx: TrxOrDb,
  id: number,
): Promise<Maybe<ReturnedSqlRow<Facility>>> {
  return trx
    .selectFrom('facilities')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst()
}

export function getFirstByHealthWorker(
  trx: TrxOrDb,
  healthWorkerId: number,
): Promise<Maybe<ReturnedSqlRow<Facility>>> {
  return trx
    .selectFrom('employment')
    .innerJoin(
      'facilities',
      'facilities.id',
      'employment.facility_id',
    )
    .where('employment.health_worker_id', '=', healthWorkerId)
    .selectAll('facilities')
    .executeTakeFirst()
}

export function getByHealthWorker(
  trx: TrxOrDb,
  healthWorkerId: number,
): Promise<Maybe<ReturnedSqlRow<Facility>[]>> {
  return trx
    .selectFrom('facilities')
    .innerJoin(
      'employment',
      'facilities.id',
      'employment.facility_id',
    )
    .where('employment.health_worker_id', '=', healthWorkerId)
    .groupBy('facilities.id')
    .selectAll('facilities')
    .execute()
}
export type EmployeeHealthWorker = {
  name: string
  is_invitee: false
  health_worker_id: number
  professions: Profession[]
  avatar_url: string
  email: string
  display_name: string
}

export type EmployeeInvitee = {
  name: null
  is_invitee: true
  health_worker_id: null
  professions: Profession[]
  avatar_url: null
  email: string
  display_name: string
}

export type FacilityEmployee = EmployeeHealthWorker | EmployeeInvitee

export async function getEmployees(
  trx: TrxOrDb,
  opts: {
    facility_id: number
    include_invitees?: boolean
  },
): Promise<FacilityEmployee[]> {
  const result = await sql<FacilityEmployee>`
    SELECT
      FALSE AS is_invitee,
      health_workers.id AS health_worker_id,
      health_workers.name AS name,
      health_workers.email as email,
      health_workers.name as display_name,
      JSON_AGG(employment.profession ORDER BY employment.profession) AS professions,
      health_workers.avatar_url AS avatar_url
    FROM
      health_workers
    INNER JOIN
      employment
    ON
      employment.health_worker_id = health_workers.id
    WHERE
      employment.facility_id = ${opts.facility_id}
    GROUP BY
      health_workers.id

    UNION ALL

    SELECT
      TRUE AS is_invitee,
      NULL AS health_worker_id,
      NULL AS name,
      health_worker_invitees.email as email,
      health_worker_invitees.email as display_name,
      JSON_AGG(health_worker_invitees.profession ORDER BY health_worker_invitees.profession) AS professions,
      NULL AS avatar_url
    FROM
      health_worker_invitees
    WHERE
      health_worker_invitees.facility_id = ${opts.facility_id}
    AND
      TRUE = ${opts.include_invitees ? 'TRUE' : 'FALSE'}
    GROUP BY
      health_worker_invitees.id

    ORDER BY
      is_invitee ASC,
      email ASC
  `.execute(trx)

  return result.rows
}
