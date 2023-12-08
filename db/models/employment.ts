import { assert } from '$std/assert/assert.ts'
import {
  Employee,
  HealthWorkerInvitee,
  Maybe,
  Profession,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import { SqlBool } from 'kysely'

export type HealthWorkerWithRegistrationState = {
  profession: Profession
  facility_id: number
  id: number
  registration_pending_approval: SqlBool
  registration_needed: SqlBool
  registration_completed: SqlBool
}

export type FacilityAdmin = {
  id: number
  email: string | null
  name: string
  facility_display_name: string
} & Employee

export function add(
  trx: TrxOrDb,
  employees: Employee[],
): Promise<ReturnedSqlRow<Employee>[]> {
  assert(employees.length > 0)
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

export function addInvitees(
  trx: TrxOrDb,
  facility_id: number,
  invites: {
    email: string
    profession: Profession
  }[],
) {
  assert(invites.length > 0)
  return trx
    .insertInto('health_worker_invitees')
    .values(invites.map((invite) => ({
      facility_id,
      ...invite,
    })))
    .returningAll()
    .execute()
}

export function approveInvitee(
  trx: TrxOrDb,
  admin_id: number,
  invitee_id: number,
) {
  return trx.updateTable('nurse_registration_details')
    .set({ approved_by: admin_id })
    .where('health_worker_id', '=', invitee_id)
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

export function getFacilityAdmin(
  trx: TrxOrDb,
  opts: {
    facility_id: number
  },
): Promise<Maybe<FacilityAdmin>> {
  return trx
    .selectFrom('employment')
    .where('facility_id', '=', opts.facility_id)
    .where('profession', '=', 'admin')
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
    .select([
      'employment.id',
      'health_worker_id',
      'health_workers.name',
      'email',
      'profession',
      'facility_id',
      'facilities.display_name as facility_display_name',
    ])
    .executeTakeFirst()
}
