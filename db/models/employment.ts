import { assert } from 'std/assert/assert.ts'
import {
  Employee,
  HasStringId,
  HealthWorkerInvitee,
  Maybe,
  Profession,
  TrxOrDb,
} from '../../types.ts'
import { SqlBool } from 'kysely'
import { now } from '../helpers.ts'

export type HealthWorkerWithRegistrationState = {
  profession: Profession
  organization_id: string
  id: string
  registration_pending_approval: SqlBool
  registration_needed: SqlBool
  registration_completed: SqlBool
}

export type OrganizationAdmin = {
  id: string
  email: string | null
  name: string
  organization_name: string
} & Employee

export function add(
  trx: TrxOrDb,
  employees: Employee[],
): Promise<HasStringId<Employee>[]> {
  assert(employees.length > 0)
  return trx
    .insertInto('employment')
    .values(employees)
    .returningAll()
    .execute()
}

export function addIgnoreDuplicate(
  trx: TrxOrDb,
  employees: Employee,
): Promise<HasStringId<Employee>> {
  return trx
    .insertInto('employment')
    .values(employees)
    .onConflict((oc) =>
      oc.constraint('only_employed_once_per_profession').doUpdateSet({
        updated_at: now,
      })
    )
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function getEmployee(
  trx: TrxOrDb,
  opts: {
    organization_id: string
    health_worker_id: string
  },
) {
  return trx
    .selectFrom('employment')
    .selectAll()
    .where('organization_id', '=', opts.organization_id)
    .where('health_worker_id', '=', opts.health_worker_id)
    .executeTakeFirst()
}

export function getName(
  trx: TrxOrDb,
  opts: {
    employment_id: string
  },
): Promise<{ name: string }> {
  return trx
    .selectFrom('employment')
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .select('health_workers.name')
    .where('employment.id', '=', opts.employment_id)
    .executeTakeFirstOrThrow()
}

export function addInvitees(
  trx: TrxOrDb,
  organization_id: string,
  invites: {
    email: string
    profession: Profession
  }[],
) {
  assert(invites.length > 0)
  return trx
    .insertInto('health_worker_invitees')
    .values(invites.map((invite) => ({
      organization_id,
      ...invite,
    })))
    .returningAll()
    .execute()
}

export function approveInvitee(
  trx: TrxOrDb,
  { admin_id, approving_id }: { admin_id: string; approving_id: string },
) {
  return trx.updateTable('nurse_registration_details')
    .set({ approved_by: admin_id })
    .where('health_worker_id', '=', approving_id)
    .execute()
}

export function getInvitees(
  trx: TrxOrDb,
  opts: {
    email: string
  },
): Promise<HasStringId<HealthWorkerInvitee>[]> {
  return trx
    .selectFrom('health_worker_invitees')
    .where('email', '=', opts.email)
    .selectAll()
    .execute()
}

export function removeInvitees(
  trx: TrxOrDb,
  ids: string[],
) {
  return trx.deleteFrom('health_worker_invitees').where('id', 'in', ids)
    .execute()
}

export function getOrganizationAdmin(
  trx: TrxOrDb,
  opts: {
    organization_id: string
  },
): Promise<Maybe<OrganizationAdmin>> {
  return trx
    .selectFrom('employment')
    .where('organization_id', '=', opts.organization_id)
    .where('profession', '=', 'admin')
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .innerJoin(
      'organizations',
      'organizations.id',
      'employment.organization_id',
    )
    .select([
      'employment.id',
      'health_worker_id',
      'health_workers.name',
      'email',
      'profession',
      'organization_id',
      'organizations.name as organization_name',
    ])
    .executeTakeFirst()
}

export async function getEmploymentLocationName(
  trx: TrxOrDb,
  opts: {
    employee_id: string
  },
) {
  return await trx
    .selectFrom('employment')
    .innerJoin(
      'organizations',
      'organizations.id',
      'employment.organization_id',
    )
    .select('organizations.name')
    .where('employment.id', '=', opts.employee_id)
    .executeTakeFirstOrThrow()
}
