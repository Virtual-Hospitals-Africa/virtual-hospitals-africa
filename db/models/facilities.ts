import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import {
  Facility,
  FacilityDoctorOrNurse,
  FacilityEmployee,
  FacilityEmployeeOrInvitee,
  Location,
  Maybe,
  Profession,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import * as employment from './employment.ts'
import partition from '../../util/partition.ts'
import {
  jsonArrayFrom,
  jsonArrayFromColumn,
  jsonBuildObject,
} from '../helpers.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

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

export function search(
  trx: TrxOrDb,
  search?: Maybe<string>,
) {
  let query = trx
    .selectFrom('facilities')
    .select([
      'id',
      'address',
      sql`ST_X(location::geometry)`.as('longitude'),
      sql`ST_Y(location::geometry)`.as('latitude'),
      'category',
      'display_name',
      'phone',
    ])
    .where('display_name', 'is not', null)

  if (search) query = query.where('display_name', 'ilike', `%${search}%`)

  return query.execute()
}

export function get(
  trx: TrxOrDb,
  opts: {
    ids: number[]
  },
) {
  assert(opts.ids.length, 'Must select nonzero facilities')
  return trx
    .selectFrom('facilities')
    .where('id', 'in', opts.ids)
    .selectAll()
    .execute()
}

export function employeeHrefSql(facility_id: number) {
  return sql<
    string
  >`CONCAT('/app/facilities/', ${facility_id}::text, '/employees/', health_workers.id::text)`
}

export function getEmployeesQuery(
  trx: TrxOrDb,
  opts: {
    facility_id: number
    professions?: Profession[]
    emails?: string[]
    is_approved?: boolean
  },
) {
  let hwQuery = trx.selectFrom('health_workers')
    .innerJoin('employment', 'employment.health_worker_id', 'health_workers.id')
    .leftJoin(
      'nurse_registration_details',
      'nurse_registration_details.health_worker_id',
      'health_workers.id',
    )
    .select((eb) => [
      'health_workers.id as health_worker_id',
      'health_workers.name as name',
      'health_workers.email as email',
      'health_workers.name as display_name',
      'health_workers.avatar_url as avatar_url',
      sql<false>`FALSE`.as('is_invitee'),
      jsonArrayFromColumn(
        'profession_details',
        eb.selectFrom('employment')
          .leftJoin(
            'nurse_specialties',
            'nurse_specialties.employee_id',
            'employment.id',
          )
          .select((inner) => [
            jsonBuildObject({
              employee_id: inner.ref('employment.id'),
              profession: inner.ref('employment.profession'),
              specialty: inner.ref('nurse_specialties.specialty'),
            }).as('profession_details'),
          ])
          .whereRef(
            'employment.health_worker_id',
            '=',
            'health_workers.id',
          )
          .groupBy([
            'employment.id',
            'nurse_specialties.specialty',
          ]).orderBy(['employment.profession asc']),
      ).as('professions'),
      employeeHrefSql(opts.facility_id).as('href'),
      sql<'pending_approval' | 'approved' | 'incomplete'>`
        CASE
          WHEN nurse_registration_details.health_worker_id IS NULL THEN 'incomplete'
          WHEN nurse_registration_details.approved_by IS NULL
              AND JSON_AGG(employment.profession ORDER BY employment.profession)::text LIKE '%"nurse"%'
              THEN 'pending_approval'
          ELSE 'approved'
        END
      `.as('registration_status'),
    ])
    .where('employment.facility_id', '=', opts.facility_id)
    .groupBy([
      'health_workers.id',
      'nurse_registration_details.approved_by',
      'nurse_registration_details.health_worker_id',
    ])

  if (opts.emails) {
    assert(Array.isArray(opts.emails))
    assert(opts.emails.length)
    hwQuery = hwQuery.where('health_workers.email', 'in', opts.emails)
  }
  if (opts.professions) {
    assert(opts.professions.length)
    hwQuery = hwQuery.where('employment.profession', 'in', opts.professions)
  }
  if (opts.is_approved) {
    console.log('TODO implement is_approved for doctors')
  }

  return hwQuery
}

export function getEmployees(
  trx: TrxOrDb,
  opts: {
    facility_id: number
    professions?: Profession[]
    emails?: string[]
    registration_status?: 'pending_approval' | 'approved' | 'incomplete'
  },
): Promise<FacilityEmployee[]> {
  return getEmployeesQuery(trx, opts).execute()
}

export async function getApprovedDoctorsAndNurses(
  trx: TrxOrDb,
  opts: {
    facility_id: number
    emails?: string[]
  },
): Promise<FacilityDoctorOrNurse[]> {
  const employees = await getEmployees(trx, {
    ...opts,
    professions: ['doctor', 'nurse'],
    registration_status: 'approved',
  })

  return employees.map(({ is_invitee, professions, ...rest }) => {
    assert(!is_invitee)
    assertEquals(professions.length, 1)
    const [{ profession, employee_id, specialty }] = professions
    assert(profession === 'doctor' || profession === 'nurse')

    return {
      ...rest,
      profession,
      employee_id,
      specialty,
    }
  })
}

export function getEmployeesAndInvitees(
  trx: TrxOrDb,
  opts: {
    facility_id: number
    professions?: Profession[]
    emails?: string[]
  },
): Promise<FacilityEmployeeOrInvitee[]> {
  const hwQuery = getEmployeesQuery(trx, opts)
  let inviteeQuery = trx.selectFrom('health_worker_invitees')
    .select((eb) => [
      sql<null | number>`NULL`.as('health_worker_id'),
      sql<null | string>`NULL`.as('name'),
      'health_worker_invitees.email as email',
      'health_worker_invitees.email as display_name',
      sql<null | string>`NULL`.as('avatar_url'),
      sql<boolean>`TRUE`.as('is_invitee'),
      jsonArrayFrom(
        jsonBuildObject({
          profession: eb.ref('health_worker_invitees.profession'),
        }),
      ).as('professions'),
      sql<null>`NULL`.as('href'),
      sql<'pending_approval' | 'approved' | 'incomplete'>`'incomplete'`.as(
        'registration_status',
      ),
    ])
    .where('health_worker_invitees.facility_id', '=', opts.facility_id)
    .groupBy('health_worker_invitees.id')

  if (opts.emails) {
    assert(Array.isArray(opts.emails))
    assert(opts.emails.length)
    inviteeQuery = inviteeQuery.where(
      'health_worker_invitees.email',
      'in',
      opts.emails,
    )
  }

  // deno-lint-ignore no-explicit-any
  return hwQuery.unionAll(inviteeQuery as any).execute()
}

export async function invite(
  trx: TrxOrDb,
  facility_id: number,
  invites: {
    email: string
    profession: Profession
  }[],
) {
  const existingEmployees = await getEmployeesAndInvitees(trx, {
    facility_id,
    emails: invites.map((invite) => invite.email),
  })

  const exactMatchingInvites = invites.filter(
    (invite) =>
      existingEmployees.some(
        (employee) =>
          invite.email === employee.email &&
          employee.professions.some(({ profession }) =>
            profession === invite.profession
          ),
      ),
  )
  if (exactMatchingInvites.length) {
    const [{ email, profession }] = exactMatchingInvites
    const error =
      `${email} is already employed as a ${profession}. Please remove them from the list.`
    return { success: false, error }
  }

  const alreadyDoctorAndTryingToInviteAsNurseOrVisaVersa = invites.filter(
    (invite) =>
      existingEmployees.some(
        (employee) =>
          invite.email === employee.email &&
          employee.professions.some(({ profession }) => (
            (profession === 'doctor' && invite.profession === 'nurse') ||
            (profession === 'nurse' && invite.profession === 'doctor')
          )),
      ),
  )
  if (alreadyDoctorAndTryingToInviteAsNurseOrVisaVersa.length) {
    const [{ email, profession }] =
      alreadyDoctorAndTryingToInviteAsNurseOrVisaVersa
    const error =
      `${email} is already employed as a ${profession} so they can't also be employed as a ${
        profession === 'nurse' ? 'doctor' : 'nurse'
      }. Please remove them from the list.`
    return { success: false, error }
  }

  const [inEmployeeTable, notInEmployeeTable] = partition(
    invites,
    (invite) =>
      existingEmployees.some((employee) => employee.email === invite.email),
  )

  if (inEmployeeTable.length) {
    await employment.add(
      trx,
      inEmployeeTable.map((invite) => ({
        facility_id,
        profession: invite.profession,
        health_worker_id: existingEmployees.find((employee) =>
          employee.email === invite.email
        )!.health_worker_id as number,
      })),
    )
  }

  if (notInEmployeeTable.length) {
    await employment.addInvitees(
      trx,
      facility_id,
      notInEmployeeTable,
    )
  }

  return {
    success: true,
  }
}
