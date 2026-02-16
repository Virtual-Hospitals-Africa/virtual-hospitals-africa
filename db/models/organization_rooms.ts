import { NonEmptyArray, RenderedRoom, TrxOrDb } from '../../types.ts'
import { jsonArrayFromColumn, jsonObjectFrom, orderByArrayPosition } from '../helpers.ts'
import { base } from './_base.ts'
import { Department, DEPARTMENTS } from '../../shared/departments.ts'

function baseQuery(trx: TrxOrDb, opts: { organization_id: string; name?: string; department_name?: Department; is_available?: boolean }) {
  return trx
    .selectFrom('organization_rooms')
    .select((eb) => [
      'organization_rooms.id',
      'organization_rooms.name',
      jsonArrayFromColumn(
        'name',
        eb.selectFrom('organization_department_rooms')
          .innerJoin(
            'organization_departments',
            'organization_department_rooms.organization_department_id',
            'organization_departments.id',
          )
          .innerJoin(
            'departments',
            'departments.name',
            'organization_departments.name',
          )
          .select([
            'organization_departments.name',
          ])
          .where(
            'organization_department_rooms.organization_room_id',
            '=',
            eb.ref('organization_rooms.id'),
          ).orderBy(
            (eb_organization_departments_order) =>
              orderByArrayPosition(
                eb_organization_departments_order,
                'organization_departments.name',
                DEPARTMENTS as NonEmptyArray<string>,
              ),
            'desc',
          ),
      ).as('departments'),
      jsonObjectFrom(
        eb.selectFrom('patient_presence')
          .innerJoin('patients', 'patients.id', 'patient_presence.id')
          .whereRef(
            'patient_presence.organization_room_id',
            '=',
            'organization_rooms.id',
          ).select([
            'patients.id',
            'patients.name',
          ]),
      ).as('occupied_by_patient'),
    ])
    .orderBy('organization_rooms.organization_id', 'asc')
    .orderBy('organization_rooms.name', 'asc')
    .where('organization_rooms.organization_id', '=', opts.organization_id)
    .$if(!!opts.name, (qb) => qb.where('organization_rooms.name', '=', opts.name!))
    .$if(!!opts.department_name, (qb) =>
      qb
        .innerJoin(
          'organization_department_rooms',
          'organization_department_rooms.organization_room_id',
          'organization_rooms.id',
        )
        .innerJoin(
          'organization_departments',
          'organization_departments.id',
          'organization_department_rooms.organization_department_id',
        )
        .where('organization_departments.name', '=', opts.department_name!))
    .$if(!!opts.is_available, (qb) =>
      qb.where(
        'organization_rooms.id',
        'not in',
        trx.selectFrom('patient_presence')
          .select('patient_presence.organization_room_id')
          .distinct(),
      ))
}

export const organization_rooms = base({
  top_level_table: 'organization_rooms',
  baseQuery,
  formatResult: (room): RenderedRoom => room,
})
