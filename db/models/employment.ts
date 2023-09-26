import {
  Employee,
  HealthWorkerInvitee,
  Profession,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import { sql, SqlBool } from 'kysely'

export type HealthWorkerWithRegistrationState = {
  profession: Profession
  facility_id: number
  id: number
  registration_pending_approval: SqlBool
  registration_needed: SqlBool
  registration_completed: SqlBool
}

export function add(
  trx: TrxOrDb,
  employees: Employee[],
): Promise<ReturnedSqlRow<Employee>[]> {
  return trx
    .insertInto('employment')
    .values(employees)
    .returningAll()
    .execute()
}

export async function isAdmin(
  trx: TrxOrDb,
  opts: {
    health_worker_id: number
    facility_id: number
  },
): Promise<boolean> {
  const matches = await trx
    .selectFrom('employment')
    .where('health_worker_id', '=', opts.health_worker_id)
    .where('facility_id', '=', opts.facility_id)
    .where('profession', '=', 'admin')
    .execute()
  if (matches.length > 1) {
    throw new Error(
      'Duplicate matches found when searching for an admin identified by: ' +
        opts.health_worker_id + ' in database',
    )
  }
  return matches.length === 1
}

export async function getFirstFacility(
  trx: TrxOrDb,
  opts: {
    employeeId: number
  },
): Promise<number | undefined> {
  const firstFacility = await trx
    .selectFrom('employment')
    .select('facility_id')
    .where('health_worker_id', '=', opts.employeeId)
    .orderBy('id')
    .executeTakeFirstOrThrow()

  return firstFacility.facility_id
}

export function getEmployee(
  trx: TrxOrDb,
  opts: {
    facility_id: number
    health_worker_id: number
  },
) {
  return trx
    .selectFrom('employment')
    .selectAll()
    .where('facility_id', '=', opts.facility_id)
    .where('health_worker_id', '=', opts.health_worker_id)
    .executeTakeFirst()
}

export function getByHealthWorker(
  trx: TrxOrDb,
  opts: {
    health_worker_id: number
  },
): Promise<HealthWorkerWithRegistrationState[]> {
  return trx
    .selectFrom('employment')
    .leftJoin('nurse_registration_details', (join) =>
      join
        .on(
          'nurse_registration_details.health_worker_id',
          '=',
          opts.health_worker_id,
        )
        .on('employment.profession', '=', 'nurse'))
    .where('employment.health_worker_id', '=', opts.health_worker_id)
    .select([
      'employment.id',
      'employment.facility_id',
      'employment.profession',
      ({ eb, and }) =>
        and([
          eb('nurse_registration_details.id', 'is not', null),
          eb('nurse_registration_details.approved_by', 'is', null),
        ]).as('registration_pending_approval'),
      ({ eb, and }) =>
        and([
          eb('nurse_registration_details.id', 'is', null),
          eb('employment.profession', '=', 'nurse'),
        ]).as('registration_needed'),
      ({ eb, or }) =>
        or([
          eb('employment.profession', '!=', 'nurse'),
          eb('nurse_registration_details.approved_by', 'is not', null),
        ]).as('registration_completed'),
    ])
    .execute()
}

export function getByFacility(
  trx: TrxOrDb,
  opts: {
    facility_id: number
  },
): Promise<ReturnedSqlRow<
  {
    id: number
    name: string
    profession: Profession
    avatar_url: string
  }
>[]> {
  return trx
    .selectFrom('employment')
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .innerJoin(
      'facilities',
      'facilities.id',
      'employment.facility_id',
    )
    .where('facility_id', '=', opts.facility_id)
    .select([
      'health_workers.name as name',
      'profession',
      'health_workers.id as id',
      'health_workers.created_at',
      'health_workers.updated_at',
      'avatar_url',
    ])
    .execute()
}

export async function getEmployeeAndInviteeByFacility(
  trx: TrxOrDb,
  opts: {
    facility_id: number
  },
): Promise<
  {
    name: string
    is_invitee: boolean
    health_worker_id: number
    professions: string
    avatar_url: string
    email: string
  }[]
> {
  const result = await sql<{
    name: string
    is_invitee: boolean
    health_worker_id: number
    professions: string
    avatar_url: string
    email: string
  }>`
    SELECT
      FALSE AS is_invitee,
      health_workers.id AS health_worker_id,
      health_workers.name AS name,
      JSON_AGG(employment.profession ORDER BY employment.profession) AS professions,
      health_workers.avatar_url AS avatar_url,
      health_workers.email as email
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
      JSON_AGG(health_worker_invitees.profession ORDER BY health_worker_invitees.profession) AS professions,
      NULL AS avatar_url,
      health_worker_invitees.email as email
    FROM
      health_worker_invitees
    WHERE
      health_worker_invitees.facility_id = ${opts.facility_id}
    GROUP BY
      health_worker_invitees.id
  `.execute(trx)

  const resultRows = result.rows.map(
    (row) => {
      const professions = row.professions as unknown as string[]
      return {
        name: row.name,
        is_invitee: row.is_invitee,
        health_worker_id: row.health_worker_id,
        professions: professions.join(', '),
        avatar_url: row.avatar_url,
        email: row.email,
      }
    },
  )

  return resultRows
}

export function getMatching(
  trx: TrxOrDb,
  opts: {
    facility_id: number
    invitees: {
      email: string
      profession: 'admin' | 'doctor' | 'nurse'
    }[]
  },
) {
  return trx
    .selectFrom('employment')
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .innerJoin(
      'facilities',
      'facilities.id',
      'employment.facility_id',
    )
    .where('facility_id', '=', opts.facility_id)
    .where(({ and, or, eb }) =>
      or(opts.invitees.map((invitee) =>
        and([
          eb('health_workers.email', '=', invitee.email),
          eb('profession', '=', invitee.profession),
        ])
      ))
    )
    .select([
      'email',
    ]).execute()
}

export function addInvitees(
  trx: TrxOrDb,
  facility_id: number,
  invites: {
    email: string
    profession: Profession
  }[],
) {
  return trx
    .insertInto('health_worker_invitees')
    .values(invites.map((invite) => ({
      facility_id,
      ...invite,
    })))
    .returningAll()
    .execute()
}

export function getInvitees(
  trx: TrxOrDb,
  opts: {
    email: string
  },
): Promise<ReturnedSqlRow<HealthWorkerInvitee>[]> {
  return trx
    .selectFrom('health_worker_invitees')
    .where('email', '=', opts.email)
    .selectAll()
    .execute()
}

export function removeInvitees(
  trx: TrxOrDb,
  ids: number[],
) {
  return trx.deleteFrom('health_worker_invitees').where('id', 'in', ids)
    .execute()
}
