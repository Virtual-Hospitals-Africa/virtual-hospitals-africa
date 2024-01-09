import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { RenderedWaitingRoom, TrxOrDb, WaitingRoom } from '../../types.ts'
import * as patients from './patients.ts'
import { jsonArrayFrom, jsonBuildObject } from '../helpers.ts'
import { hasName } from '../../util/haveNames.ts'
import { employeeHrefSql } from './facilities.ts'

export function add(
  trx: TrxOrDb,
  opts: WaitingRoom,
) {
  return trx
    .insertInto('waiting_room')
    .values(opts)
    .returning('id')
    .executeTakeFirstOrThrow()
}

export function remove(
  trx: TrxOrDb,
  { id }: { id: number },
) {
  return trx
    .deleteFrom('waiting_room')
    .where('id', '=', id)
    .execute()
}

export async function get(
  trx: TrxOrDb,
  { facility_id }: {
    facility_id: number
  },
): Promise<RenderedWaitingRoom[]> {
  const query = trx
    .selectFrom('waiting_room')
    .innerJoin(
      'patient_encounters',
      'patient_encounters.id',
      'waiting_room.patient_encounter_id',
    )
    .innerJoin('patients', 'patients.id', 'patient_encounters.patient_id')
    .leftJoin(
      'appointments',
      'appointments.id',
      'patient_encounters.appointment_id',
    )
    .where('waiting_room.facility_id', '=', facility_id)
    .select((eb) => [
      jsonBuildObject({
        id: eb.ref('patients.id'),
        name: eb.ref('patients.name'),
        avatar_url: patients.avatar_url_sql,
      }).as('patient'),
      'patient_encounters.reason',
      jsonBuildObject({
        view_href: eb.case()
          .when(
            eb('patients.completed_intake', '=', true),
          ).then(sql<string>`concat('/app/patients/', patients.id::text)`)
          .else(null).end(),
        intake_href: eb.case()
          .when(
            eb('patients.completed_intake', '=', false),
          ).then(
            sql<
              string
            >`concat('/app/patients/', patients.id::text, '/intake/personal')`,
          )
          .else(null).end(),
      }).as('actions'),
      sql<boolean>`patient_encounters.reason = 'emergency'`.as('is_emergency'),
      'patient_encounters.closed_at',
      'appointments.id as appointment_id',
      'appointments.start as appointment_start',
      jsonArrayFrom(
        eb.selectFrom('appointment_health_worker_attendees')
          .innerJoin(
            'health_workers',
            'health_workers.id',
            'appointment_health_worker_attendees.health_worker_id',
          )
          .whereRef(
            'appointment_health_worker_attendees.appointment_id',
            '=',
            'appointments.id',
          )
          .select([
            'health_workers.id',
            'health_workers.name',
          ]),
      ).as('appointment_health_workers'),
      jsonArrayFrom(
        eb.selectFrom('patient_encounter_providers')
          .innerJoin(
            'employment',
            'patient_encounter_providers.provider_id',
            'employment.id',
          )
          .innerJoin(
            'health_workers',
            'health_workers.id',
            'employment.health_worker_id',
          )
          .whereRef(
            'patient_encounter_providers.patient_encounter_id',
            '=',
            'patient_encounters.id',
          )
          .select([
            'employment.health_worker_id',
            'employment.id as employee_id',
            'health_workers.name',
            'employment.profession',
            'patient_encounter_providers.seen_at',
            employeeHrefSql(facility_id).as('href'),
          ]),
      ).as('providers'),
    ])
    .orderBy(['is_emergency desc', 'waiting_room.created_at asc'])

  console.log(query.compile().sql)
  const patients_in_waiting_room = await query.execute()

  return patients_in_waiting_room.map(
    (
      {
        patient,
        appointment_id,
        appointment_start,
        appointment_health_workers,
        closed_at,
        ...rest
      },
    ) => {
      assert(
        !closed_at,
        'Patient cannot be in waiting room for an encounter that has closed',
      )
      assert(hasName(patient), 'Patient must have a name')

      if (!appointment_id) {
        return {
          ...rest,
          patient,
          appointment: null,
        }
      }
      assert(appointment_start, 'Appointment must have a start time')
      assert(
        appointment_health_workers?.length,
        'Appointment must have at least one health worker',
      )

      return {
        ...rest,
        patient,
        appointment: {
          id: appointment_id,
          start: appointment_start,
          health_workers: appointment_health_workers,
        },
      }
    },
  )
}
