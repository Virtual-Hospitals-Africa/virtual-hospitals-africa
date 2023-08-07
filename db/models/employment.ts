import {
  Employee,
  HealthWorkerInvitee,
  Profession,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'

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
) {
  return trx
    .selectFrom('employment')
    .selectAll()
    .where('health_worker_id', '=', opts.health_worker_id)
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
