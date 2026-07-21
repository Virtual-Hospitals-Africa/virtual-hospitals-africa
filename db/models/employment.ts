import { sql } from 'kysely'
import { RenderedEmploymentRow, TrxOrDbOrQueryCreator } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { blankSelection, isoDate } from '../helpers.ts'
import { health_workers } from './health_workers.ts'

export const employment = {
  async search(
    trx: TrxOrDbOrQueryCreator,
    search_terms: { search?: string | null; role?: string | null; is_admin?: boolean | null },
    opts?: { page?: number; rows_per_page?: number },
  ) {
    const page = opts?.page ?? 1
    const rows_per_page = opts?.rows_per_page ?? 10
    const offset = (page - 1) * rows_per_page

    const results = await trx
      .selectFrom('employment')
      .innerJoin('health_workers', 'health_workers.id', 'employment.health_worker_id')
      .innerJoin('organizations', 'organizations.id', 'employment.organization_id')
      .select((eb) => [
        'employment.id',
        'employment.health_worker_id',
        'health_workers.name as health_worker_name',
        'employment.organization_id',
        'organizations.name as organization_name',
        'employment.role',
        'employment.is_admin',
        'employment.seniority_order',
        isoDate(eb.ref('employment.created_at')).as('created_at'),
      ])
      .$if(!!search_terms.search, (qb) =>
        qb.where((eb) =>
          eb.or([
            eb('health_workers.name', 'ilike', `%${search_terms.search}%`),
            eb('organizations.name', 'ilike', `%${search_terms.search}%`),
          ])
        ))
      .$if(!!search_terms.role, (qb) => qb.where('employment.role', '=', search_terms.role!))
      .$if(search_terms.is_admin != null, (qb) => qb.where('employment.is_admin', '=', search_terms.is_admin!))
      .orderBy('employment.created_at', 'desc')
      .limit(rows_per_page + 1)
      .offset(offset)
      .execute()

    return {
      page,
      rows_per_page,
      results: results.slice(0, rows_per_page) as RenderedEmploymentRow[],
      has_next_page: results.length > rows_per_page,
      search_terms,
    }
  },
  addOne(
    trx: TrxOrDbOrQueryCreator,
    { department_ids, seniority_order, organization_id, ...employee }: {
      health_worker_id: string
      role: string
      organization_id: string
      is_admin: boolean
      department_ids?: string[]
      seniority_order?: number
    },
  ) {
    health_workers.invalidateCacheOne(employee.health_worker_id)
    const id = generateUUID()

    return trx.with(
      'employment_insert',
      (qb) =>
        qb.insertInto('employment')
          .values({
            id,
            organization_id,
            seniority_order: seniority_order || trx.selectFrom('employment')
              .select(sql<number>`
                coalesce(1 + max(employment.seniority_order), 1)
              `.as('seniority_order'))
              .where('employment.organization_id', '=', organization_id),
            ...employee,
          })
          .returningAll(),
    ).with(
      'department_insert',
      (qb) =>
        department_ids?.length
          ? qb.insertInto('department_employment')
            .values(department_ids.map((department_id) => ({
              department_id,
              employment_id: id,
            })))
          : blankSelection(qb),
    )
      .selectFrom('employment_insert')
      .selectAll('employment_insert')
      .executeTakeFirstOrThrow()
  },
}
