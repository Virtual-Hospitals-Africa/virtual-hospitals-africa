import { TrxOrDb } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { blankSelection } from '../helpers.ts'
import { health_workers } from './health_workers.ts'

export const employment = {
  addOne(
    trx: TrxOrDb,
    { department_ids, ...employee }: {
      health_worker_id: string
      organization_id: string
      is_admin: boolean
      department_ids?: string[]
    },
  ) {
    health_workers.invalidateCacheOne(employee.health_worker_id)
    const id = generateUUID()

    return trx.with(
      'employment_insert',
      (qb) =>
        qb.insertInto('employment')
          .values({ id, ...employee })
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
