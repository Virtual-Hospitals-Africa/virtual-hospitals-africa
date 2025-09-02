import { assert } from 'std/assert/assert.ts'
import {
  HasStringId,
  HealthWorkerInvitee,
  Maybe,
  Profession,
  TrxOrDb,
} from '../../types.ts'
import { SqlBool } from 'kysely'
import generateUUID from '../../util/uuid.ts'
import { pMap } from '../../util/inParallel.ts'
import { blankSelection } from '../helpers.ts'

type Employee = {
  health_worker_id: string
  profession: Profession
  organization_id: string
  specialty?: Maybe<string>
}

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

export function addOne(
  trx: TrxOrDb,
  { department_id, profession, ...rest }: Employee & {
    department_id?: string
  },
) {
  const id = generateUUID()

  return trx.with(
    'employment_insert',
    (qb) =>
      qb.insertInto('employment')
        .values({ id, profession, ...rest })
        .returningAll(),
  ).with(
    'department_insert',
    (qb) =>
      department_id
        ? qb.insertInto('department_employment')
          .values({
            department_id,
            employment_id: id,
          })
        : blankSelection(qb),
  ).with(
    'organization_admin_insert',
    (qb) =>
      (profession === 'admin')
        ? qb.insertInto('organization_admins').values({ id })
        : blankSelection(qb),
  ).with(
    'provider_insert',
    (qb) =>
      (profession === 'doctor' || profession === 'nurse')
        ? qb.insertInto('providers').values({ id })
        : blankSelection(qb),
  ).with(
    'doctor_insert',
    (qb) =>
      (profession === 'doctor')
        ? qb.insertInto('doctors').values({ id })
        : blankSelection(qb),
  ).with(
    'nurse_insert',
    (qb) =>
      (profession === 'nurse')
        ? qb.insertInto('nurses').values({ id })
        : blankSelection(qb),
  )
    .selectFrom('employment_insert')
    .selectAll('employment_insert')
    .executeTakeFirstOrThrow()
}

export function add(
  trx: TrxOrDb,
  employees: Employee[],
): Promise<HasStringId<Employee>[]> {
  assert(employees.length)
  return pMap(employees, (employee) => addOne(trx, employee))
}

export async function addIgnoreDuplicate(
  trx: TrxOrDb,
  employee: Employee,
): Promise<HasStringId<Employee>> {
  const existing_employee = await trx.selectFrom('employment')
    .where('health_worker_id', '=', employee.health_worker_id)
    .where('organization_id', '=', employee.organization_id)
    .where('profession', '=', employee.profession)
    .selectAll()
    .executeTakeFirst()

  return existing_employee || await addOne(trx, employee)
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
      'specialty',
      'organization_id',
      'organizations.name as organization_name',
    ])
    .executeTakeFirst()
}

export function getEmploymentLocationName(
  trx: TrxOrDb,
  opts: {
    employee_id: string
  },
) {
  return trx
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

export function updateSpecialty(
  trx: TrxOrDb,
  opts: {
    employee_id: string
    specialty: string
  },
) {
  return trx.updateTable('employment')
    .where('employment.id', '=', opts.employee_id)
    .set({ specialty: opts.specialty })
    .executeTakeFirstOrThrow()
}
