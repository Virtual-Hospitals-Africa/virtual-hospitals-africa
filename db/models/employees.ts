import { SelectQueryBuilder, sql } from 'kysely'
import { RenderedEmployee, TrxOrDb } from '../../types.ts'
import * as health_workers from './health_workers.ts'
import { base } from './_base.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { assertArrayNonEmpty } from '../../util/arraySize.ts'
import { DB } from '../../db.d.ts'

export function baseQuery(trx: TrxOrDb): SelectQueryBuilder<
  DB,
  'health_workers' | 'employment',
  RenderedEmployee
> {
  return health_workers.baseQuery(trx)
    .innerJoin('employment', 'employment.health_worker_id', 'health_workers.id')
    .select([
      'employment.id as employee_id',
      'employment.organization_id',
      'employment.profession',
      'employment.specialty',
      sql<string>`
        '/app/organizations/' || employment.organization_id::text || '/employees/' || employment.health_worker_id::text
      `.as('href'),
    ])
}

const model = base({
  top_level_table: 'employment',
  baseQuery,
  formatResult: (
    { organizations, ...employee },
  ): RenderedEmployee => {
    assertArrayNonEmpty(organizations)
    return {
      ...employee,
      organizations,
    }
  },
  handleSearch(
    qb,
    opts: health_workers.HealthWorkerSearch,
  ) {
    if (opts.search) {
      qb = qb.where('health_workers.name', 'ilike', `%${opts.search}%`)
    }

    if (opts.professions) {
      assertOr400(opts.professions.length > 0, 'professions must not be empty')
      qb = qb.where(
        'employment.profession',
        'in',
        opts.professions,
      )
    }

    if (opts.organization_id) {
      qb = qb.where(
        'employment.organization_id',
        '=',
        opts.organization_id,
      )
    }

    if (opts.prioritize_organization_id) {
      qb = qb.orderBy(
        (eb) =>
          eb(
            'employment.organization_id',
            '=',
            opts.prioritize_organization_id!,
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
