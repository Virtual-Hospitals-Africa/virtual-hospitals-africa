import { UpdateResult } from 'kysely'
import {
  EmployedHealthWorker,
  HasStringId,
  HealthWorker,
  IdSelection,
  InsertShape,
  Maybe,
  PossiblyEmployedHealthWorker,
  TrxOrDb,
} from '../../types.ts'
import { jsonArrayFrom, jsonBuildObject } from '../helpers.ts'
import { assert } from 'std/assert/assert.ts'
import pick from '../../util/pick.ts'
import { groupBy } from '../../util/groupBy.ts'
import { assertDepartmentName } from '../../shared/departments.ts'
import { assertAll } from '../../util/assertAll.ts'
import { HealthWorkers, Profession } from '../../db.d.ts'
import { asNames, NameInputs } from './asNames.ts'
import { base } from './_base.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { assertOr400 } from '../../util/assertOr.ts'

type HealthWorkerUpsert =
  & {
    id?: string
    avatar_url: string
    email: string
  }
  & NameInputs

function asHealthWorkerValues(
  health_worker: HealthWorkerUpsert,
): InsertShape<HealthWorkers> {
  return {
    ...health_worker,
    ...asNames(health_worker),
  }
}

export function upsert(
  trx: TrxOrDb,
  details: HealthWorkerUpsert,
): Promise<HasStringId<HealthWorker>> {
  const to_upsert = asHealthWorkerValues(details)
  return trx
    .insertInto('health_workers')
    .values(to_upsert)
    .onConflict((oc) => oc.column('email').doUpdateSet(details))
    .returning([
      'id',
      'name',
      'first_names',
      'surname',
      'preferred_name',
      'email',
      'avatar_url',
    ])
    .executeTakeFirstOrThrow()
}

export function updateNames(
  trx: TrxOrDb,
  health_worker_id: string,
  names: {
    name: string
    first_names: string
    surname: string
    preferred_name: string
  },
): Promise<UpdateResult[]> {
  return trx
    .updateTable('health_workers')
    .set(names)
    .where('id', '=', health_worker_id)
    .execute()
}

export const pickHealthWorkerDetails = pick([
  'name',
  'email',
  'avatar_url',
])

export function isHealthWorker(
  health_worker: unknown,
): health_worker is PossiblyEmployedHealthWorker {
  return (
    isObjectLike(health_worker) &&
    ('id' in health_worker && typeof health_worker.id === 'string') &&
    ('name' in health_worker && typeof health_worker.name === 'string') &&
    ('email' in health_worker && typeof health_worker.email === 'string')
  )
}

export function isEmployed(
  health_worker: unknown,
): health_worker is EmployedHealthWorker {
  return isHealthWorker(health_worker) &&
    'employment' in health_worker &&
    Array.isArray(health_worker.employment) &&
    !!health_worker.employment.length &&
    'default_organization_id' in health_worker &&
    typeof health_worker.default_organization_id === 'string'
}

export function baseQuery(trx: TrxOrDb) {
  return trx
    .selectFrom('health_workers')
    .leftJoin(
      'nurse_registration_details',
      'health_workers.id',
      'nurse_registration_details.health_worker_id',
    )
    .select((eb) => [
      'health_workers.id',
      'health_workers.name',
      'health_workers.first_names',
      'health_workers.surname',
      'health_workers.preferred_name',
      'health_workers.email',
      'health_workers.avatar_url',
      eb('nurse_registration_details.health_worker_id', 'is', null).as(
        'registration_needed',
      ),
      'nurse_registration_details.approved_by',
      jsonArrayFrom(
        eb.selectFrom('employment')
          .innerJoin(
            'organizations',
            'employment.organization_id',
            'organizations.id',
          )
          .leftJoin(
            'addresses as organization_address',
            'organizations.address_id',
            'organization_address.id',
          )
          .leftJoin(
            'health_worker_organization_calendars',
            (join) =>
              join
                .onRef(
                  'employment.organization_id',
                  '=',
                  'health_worker_organization_calendars.organization_id',
                )
                .onRef(
                  'employment.health_worker_id',
                  '=',
                  'health_worker_organization_calendars.health_worker_id',
                ),
          )
          .select((eb_employment) => [
            'employment.id as employment_id',
            'employment.profession',
            'employment.specialty',
            'health_worker_organization_calendars.gcal_appointments_calendar_id',
            'health_worker_organization_calendars.gcal_availability_calendar_id',
            'health_worker_organization_calendars.availability_set',
            jsonBuildObject({
              id: eb_employment.ref('employment.organization_id'),
              name: eb_employment.ref('organizations.name'),
              address: eb_employment.ref('organization_address.formatted'),
            }).as('organization'),
            jsonArrayFrom(
              eb_employment.selectFrom('department_employment')
                .innerJoin(
                  'organization_departments',
                  'organization_departments.id',
                  'department_employment.department_id',
                )
                .whereRef(
                  'department_employment.employment_id',
                  '=',
                  'employment.id',
                )
                .select([
                  'organization_departments.id',
                  'organization_departments.name',
                ]),
            ).as('departments'),
          ])
          .whereRef(
            'employment.health_worker_id',
            '=',
            'health_workers.id',
          ),
      ).as('employment'),
    ])
}

export type HealthWorkerSearch = {
  search?: Maybe<string>
  organization_id?: Maybe<string>
  professions?: Maybe<Profession[]>
  prioritize_organization_id?: Maybe<string>
}

const model = base({
  top_level_table: 'health_workers',
  baseQuery,
  formatResult: (
    {
      registration_needed,
      approved_by,
      ...health_worker
    },
  ): PossiblyEmployedHealthWorker => {
    const employment_by_organization = groupBy(
      health_worker.employment,
      (e) => e.organization.id,
    )
    const employment = [...employment_by_organization.values()].map(
      (roles) => {
        const nurse_role = roles.find((r) => r.profession === 'nurse') || null
        const doctor_role = roles.find((r) => r.profession === 'doctor') || null
        const admin_role = roles.find((r) => r.profession === 'admin') || null
        const receptionist_role = roles.find((r) =>
          r.profession === 'receptionist'
        ) || null
        assert(nurse_role || doctor_role || admin_role || receptionist_role)
        if (nurse_role) {
          assert(!doctor_role)
          assert(!receptionist_role)
        }
        if (doctor_role) {
          assert(!nurse_role)
          assert(!receptionist_role)
        }
        if (receptionist_role) {
          assert(!doctor_role)
          assert(!nurse_role)
        }

        const provider_id = nurse_role?.employment_id ||
          doctor_role?.employment_id || null

        const {
          organization,
          gcal_appointments_calendar_id,
          gcal_availability_calendar_id,
          availability_set,
          departments,
        } = roles[0]
        assertAll(departments, assertDepartmentName)

        return {
          organization,
          gcal_appointments_calendar_id,
          gcal_availability_calendar_id,
          availability_set,
          departments,
          provider_id,
          non_admin_id: provider_id || receptionist_role?.employment_id || null,
          roles: {
            nurse: nurse_role && {
              registration_needed: !!registration_needed,
              registration_completed: !!approved_by,
              registration_pending_approval: !approved_by,
              employment_id: nurse_role.employment_id,
            },
            doctor: doctor_role && {
              registration_needed: false,
              registration_completed: true,
              registration_pending_approval: false,
              employment_id: doctor_role.employment_id,
            },
            admin: admin_role && {
              registration_needed: false,
              registration_completed: true,
              registration_pending_approval: false,
              employment_id: admin_role.employment_id,
            },
            receptionist: receptionist_role && {
              registration_needed: false,
              registration_completed: true,
              registration_pending_approval: false,
              employment_id: receptionist_role.employment_id,
            },
          },
        }
      },
    )

    return {
      ...health_worker,
      employment,
      default_organization_id: employment[0]?.organization.id ?? null,
    }
  },
  handleSearch(
    qb,
    opts: HealthWorkerSearch,
    trx,
  ) {
    if (opts.search) {
      qb = qb.where('health_workers.name', 'ilike', `%${opts.search}%`)
    }

    if (opts.professions) {
      assertOr400(opts.professions.length > 0, 'professions must not be empty')
      qb = qb.where(
        'health_workers.id',
        'in',
        trx.selectFrom('employment')
          .where('profession', 'in', opts.professions)
          .select('health_worker_id'),
      )
    }

    if (opts.organization_id) {
      qb = qb.where(
        'health_workers.id',
        'in',
        trx.selectFrom('employment')
          .where('organization_id', '=', opts.organization_id)
          .select('health_worker_id'),
      )
    }

    if (opts.prioritize_organization_id) {
      qb = qb.orderBy(
        (eb) =>
          eb.exists(
            eb.selectFrom('employment')
              .whereRef(
                'employment.health_worker_id',
                '=',
                'health_workers.id',
              )
              .where(
                'employment.organization_id',
                '=',
                opts.prioritize_organization_id!,
              ),
          ),
        'desc',
      )
    }

    return qb
  },
})

export const getById = model.getById
export const getByIdOptional = model.getByIdOptional
export const search = model.search
export const findAll = model.findAll
export const findOne = model.findOne
export const findOneOptional = model.findOneOptional
export const searchQuery = model.searchQuery
export const formatResult = model.formatResult

export async function getEmployed(
  trx: TrxOrDb,
  { health_worker_id }: { health_worker_id: string | IdSelection },
): Promise<EmployedHealthWorker> {
  const health_worker = await getById(trx, health_worker_id)
  assert(isEmployed(health_worker))
  return health_worker
}

export function removeById(
  trx: TrxOrDb,
  id: string,
) {
  return trx
    .deleteFrom('health_workers')
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}
