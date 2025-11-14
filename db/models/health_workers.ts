import { assert } from 'std/assert/assert.ts'
import { sql, UpdateResult } from 'kysely'
import {
  EmployedHealthWorker,
  IdSelection,
  InsertShape,
  Maybe,
  NonEmptyArray,
  PossiblyEmployedHealthWorker,
  TrxOrDb,
} from '../../types.ts'
import * as organizations from './organizations.ts'
import {
  jsonArrayFrom,
  jsonArrayFromColumn,
  orderByArrayPosition,
} from '../helpers.ts'
import pick from '../../util/pick.ts'
import { HealthWorkers, Profession } from '../../db.d.ts'
import { asNames, NameInputs } from './asNames.ts'
import { base } from './_base.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { DEPARTMENTS } from '../../shared/departments.ts'
import isString from '../../util/isString.ts'
import generateUUID from '../../util/uuid.ts'

export const avatar_url_sql = sql<string | null>`
  CASE WHEN health_workers.avatar_media_id IS NOT NULL
    THEN concat('/health_workers/', health_workers.id::text, '/avatar')
    ELSE NULL
  END
`

export type HealthWorkerUpsert =
  & {
    id?: string
    avatar_media_id?: string | null
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
) {
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
      'avatar_media_id',
    ])
    .executeTakeFirstOrThrow()
}

export async function getIdByEmailOrGenerateNew(
  trx: TrxOrDb,
  email: string,
) {
  const health_worker = await trx.selectFrom('health_workers')
    .where('email', '=', email)
    .select('id')
    .executeTakeFirst()

  return health_worker?.id || generateUUID()
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
  'avatar_media_id',
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
    'organizations' in health_worker &&
    Array.isArray(health_worker.organizations) &&
    !!health_worker.organizations.length
}

export function baseQuery(trx: TrxOrDb) {
  return trx
    .selectFrom('health_workers')
    .select((eb) => [
      'health_workers.id',
      'health_workers.name',
      'health_workers.first_names',
      'health_workers.surname',
      'health_workers.preferred_name',
      'health_workers.email',
      avatar_url_sql.as('avatar_url'),
      jsonArrayFrom(
        organizations.baseQuery(trx)
          .where(
            'organizations.id',
            'in',
            eb.selectFrom('employment')
              .whereRef(
                'employment.health_worker_id',
                '=',
                'health_workers.id',
              )
              .select('employment.organization_id')
              .distinct(),
          )
          .innerJoin(
            'employment',
            (join) =>
              join.onRef('employment.organization_id', '=', 'organizations.id')
                .on(
                  'employment.health_worker_id',
                  '=',
                  eb.ref('health_workers.id'),
                ),
          )
          .select((eb_employment) => [
            'employment.id as employment_id',
            'profession',
            'specialty',
            'is_admin',
            jsonArrayFromColumn(
              'department_id',
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
                .select('organization_departments.id as department_id')
                .orderBy(
                  (eb_employment_departments_order) =>
                    orderByArrayPosition(
                      eb_employment_departments_order,
                      'organization_departments.name',
                      DEPARTMENTS as NonEmptyArray<string>,
                    ),
                  'desc',
                ),
            ).as('department_ids'),
          ]).orderBy(
            // TODO order by most recently interacted with?
            (eb_organization_order) =>
              eb_organization_order.case().when(
                'organizations.category',
                'ilike',
                '%ent%',
              ).then(2).when(
                'organizations.category',
                'ilike',
                '%ospital%',
              ).then(1)
                .else(0)
                .end(),
            'desc',
          ),
      ).as('organizations'),
    ])
}

export type HealthWorkerSearch = {
  search?: Maybe<string>
  organization_id?: string | string[] | IdSelection
  professions?: Maybe<Profession[]>
  prioritize_organization_id?: Maybe<string>
}

const model = base({
  top_level_table: 'health_workers',
  baseQuery,
  formatResult: (x): PossiblyEmployedHealthWorker => x,
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
          .where(
            'organization_id',
            'in',
            isString(opts.organization_id)
              ? [opts.organization_id]
              : opts.organization_id,
          )
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

export function getAvatar(trx: TrxOrDb, opts: { health_worker_id: string }) {
  return trx
    .selectFrom('media')
    .innerJoin('health_workers', 'health_workers.avatar_media_id', 'media.id')
    .select(['media.mime_type', 'media.binary_data'])
    .where('health_workers.id', '=', opts.health_worker_id)
    .executeTakeFirst()
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
