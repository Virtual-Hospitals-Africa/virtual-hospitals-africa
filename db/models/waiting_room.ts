import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { RenderedWaitingRoom, TrxOrDb, WaitingRoom } from '../../types.ts'
import * as patients from './patients.ts'
import { jsonArrayFrom, jsonBuildObject } from '../helpers.ts'
import { hasName } from '../../util/haveNames.ts'

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

function arrivedAgoDisplay(wait_time: string) {
  const [hours, minutes] = wait_time.split(':').map(Number)
  if (!hours && !minutes) {
    return 'Just now'
  }
  if (hours > 1) {
    return `${hours} hours ago`
  }
  if (hours === 0 && minutes === 1) {
    return '1 minute ago'
  }
  return `${(60 * hours) + minutes} minutes ago`
}

// A slight misnomer, this function returns the patients in the waiting room
// and the patients who are actively being seen by a provider at the facility.
export async function get(
  trx: TrxOrDb,
  { facility_id }: {
    facility_id: number
  },
): Promise<RenderedWaitingRoom[]> {
  const facility_waiting_room = trx
    .selectFrom('waiting_room')
    .where('waiting_room.facility_id', '=', facility_id)
    .select('patient_encounter_id')

  const seeing_facility_providers = trx
    .selectFrom('patient_encounter_providers')
    .innerJoin(
      'employment',
      'patient_encounter_providers.provider_id',
      'employment.id',
    )
    .where('employment.facility_id', '=', facility_id)
    .select('patient_encounter_providers.patient_encounter_id')

  const encounters_to_show = facility_waiting_room.union(
    seeing_facility_providers,
  ).distinct()

  const query = trx
    .selectFrom('patient_encounters')
    .leftJoin(
      'waiting_room',
      'patient_encounters.id',
      'waiting_room.patient_encounter_id',
    )
    .innerJoin('patients', 'patients.id', 'patient_encounters.patient_id')
    .leftJoin(
      'appointments',
      'appointments.id',
      'patient_encounters.appointment_id',
    )
    .select((eb) => [
      jsonBuildObject({
        id: eb.ref('patients.id'),
        name: eb.ref('patients.name'),
        avatar_url: patients.avatar_url_sql,
        description: sql<
          string | null
        >`patients.gender || ', ' || to_char(date_of_birth, 'DD/MM/YYYY')`,
      }).as('patient'),
      'patient_encounters.reason',
      jsonBuildObject({
        view: eb.case()
          .when(
            eb('patients.completed_intake', '=', true),
          ).then(sql<string>`concat('/app/patients/', patients.id::text)`)
          .else(null).end(),
        intake: eb.case()
          .when(
            eb('patients.completed_intake', '=', false),
          ).then(
            sql<
              string
            >`concat('/app/patients/', patients.id::text, '/intake/personal')`,
          )
          .else(null).end(),
      }).as('actions'),
      eb('patient_encounters.reason', '=', 'emergency').as('is_emergency'),
      'appointments.id as appointment_id',
      'appointments.start as appointment_start',
      'completed_intake',
      sql<string>`(current_timestamp - patient_encounters.created_at)::interval`
        .as('wait_time'),
      eb('waiting_room.id', 'is not', null).as('in_waiting_room'),
      eb.selectFrom('intake')
        .leftJoin(
          'patient_intake',
          (join) =>
            join
              .onRef('patient_intake.intake_step', '=', 'intake.step')
              .onRef('patient_intake.patient_id', '=', 'patients.id'),
        )
        .where('patient_intake.id', 'is', null)
        .orderBy('intake.order', 'asc')
        .select('step')
        .limit(1)
        .as('awaiting_intake_step'),
      eb.selectFrom('intake')
        .innerJoin(
          'patient_intake',
          (join) =>
            join
              .onRef('patient_intake.intake_step', '=', 'intake.step')
              .onRef('patient_intake.patient_id', '=', 'patients.id'),
        )
        .orderBy('intake.order', 'desc')
        .select('step')
        .limit(1)
        .as('last_completed_intake_step'),

      eb.selectFrom('encounter')
        .leftJoin(
          'patient_encounter_steps',
          (join) =>
            join
              .onRef(
                'patient_encounter_steps.encounter_step',
                '=',
                'encounter.step',
              )
              .onRef(
                'patient_encounter_steps.patient_encounter_id',
                '=',
                'patient_encounters.id',
              ),
        )
        .where('patient_encounter_steps.id', 'is', null)
        .orderBy('encounter.order', 'asc')
        .select('step')
        .limit(1)
        .as('awaiting_encounter_step'),

      eb.selectFrom('encounter')
        .innerJoin(
          'patient_encounter_steps',
          (join) =>
            join
              .onRef(
                'patient_encounter_steps.encounter_step',
                '=',
                'encounter.step',
              )
              .onRef(
                'patient_encounter_steps.patient_encounter_id',
                '=',
                'patient_encounters.id',
              ),
        )
        .orderBy('encounter.order', 'desc')
        .select('step')
        .limit(1)
        .as('last_completed_encounter_step'),
      jsonArrayFrom(
        eb.selectFrom('appointment_providers')
          .innerJoin(
            'health_workers',
            'health_workers.id',
            'appointment_providers.health_worker_id',
          )
          .whereRef(
            'appointment_providers.appointment_id',
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
            sql<
              string
            >`concat('/app/facilities/', employment.facility_id::text, '/employees/', health_workers.id::text)`
              .as('href'),
          ]),
      ).as('providers'),
    ]).where('patient_encounters.id', 'in', encounters_to_show)
    .where('patient_encounters.closed_at', 'is', null)
    .orderBy(['is_emergency desc', 'waiting_room.created_at asc'])

  const patients_in_waiting_room = await query.execute()

  return patients_in_waiting_room.map(
    (
      {
        patient,
        appointment_id,
        appointment_start,
        appointment_health_workers,
        wait_time,
        completed_intake,
        in_waiting_room,
        awaiting_intake_step,
        last_completed_intake_step,
        awaiting_encounter_step,
        last_completed_encounter_step,
        ...rest
      },
    ) => {
      assert(hasName(patient), 'Patient must have a name')

      let appointment: RenderedWaitingRoom['appointment'] = null
      if (appointment_id) {
        assert(appointment_start, 'Appointment must have a start time')
        assert(
          appointment_health_workers?.length,
          'Appointment must have at least one health worker',
        )
        appointment = {
          id: appointment_id,
          start: appointment_start,
          health_workers: appointment_health_workers,
        }
      }

      // TODO: clean this up?
      let status: string
      if (completed_intake) {
        if (in_waiting_room) {
          if (last_completed_encounter_step) {
            status = `Awaiting Consultation (${awaiting_encounter_step})`
          } else {
            status = 'Awaiting Consultation'
          }
        } else {
          status = `In Consultation (${awaiting_encounter_step})`
        }
      } else {
        if (in_waiting_room) {
          if (last_completed_intake_step) {
            status = `Awaiting Intake (${awaiting_intake_step})`
          } else {
            status = 'Awaiting Intake'
          }
        } else {
          status = `In Intake (${awaiting_intake_step})`
        }
      }
      assert(status)

      return {
        ...rest,
        patient,
        status,
        in_waiting_room,
        appointment,
        arrived_ago_display: arrivedAgoDisplay(wait_time),
      }
    },
  )
}
