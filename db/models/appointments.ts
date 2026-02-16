import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import {
  Appointment,
  HasStringId,
  PatientAppointmentOfferedTime,
  PatientAppointmentRequest,
  PatientAppointmentRequestMedia,
  SchedulingAppointmentOfferedTime,
  TrxOrDbOrQueryCreator,
} from '../../types.ts'
import uniq from '../../util/uniq.ts'
import { patients } from './patients.ts'
import { employees } from './employees.ts'
import isDate from '../../util/isDate.ts'
import { jsonArrayFrom, jsonBuildObject, now, today_in_johannesburg, tomorrow_in_johannesburg } from '../helpers.ts'

type AppointmentQuery = {
  time_range: 'all' | 'future' | 'past' | 'today'
  organization_id?: string
  patient_id?: string
}

export type AppointmentProviderWithGoogleCalendar = Awaited<
  ReturnType<typeof appointments.getForPatient>
>[0]['employees'][0]

export const appointments = {
  addOfferedTime(
    trx: TrxOrDbOrQueryCreator,
    { employee_id, ...offered }: Omit<
      PatientAppointmentOfferedTime,
      'declined'
    >,
  ): Promise<SchedulingAppointmentOfferedTime> {
    return trx.with(
      'inserted_offer_time',
      (qb) =>
        qb.insertInto('patient_appointment_offered_times')
          .values({
            employee_id,
            ...offered,
          })
          .returningAll(),
    ).with(
      'inserted_with_health_worker_name',
      (qb) =>
        qb.selectFrom('health_workers')
          .innerJoin(
            'employment',
            'employment.health_worker_id',
            'health_workers.id',
          )
          .innerJoin(
            'inserted_offer_time',
            'employment.id',
            'inserted_offer_time.employee_id',
          )
          .selectAll('inserted_offer_time')
          .select('health_workers.name as health_worker_name')
          .select('employment.role')
          .select('employment.is_admin'),
    )
      .selectFrom('inserted_with_health_worker_name')
      .selectAll()
      .executeTakeFirstOrThrow()
  },

  declineOfferedTimes(trx: TrxOrDbOrQueryCreator, ids: string[]) {
    assert(ids.length, 'Must provide ids to decline')
    return trx
      .updateTable('patient_appointment_offered_times')
      .set({ declined: true })
      .where('id', 'in', ids)
      .execute()
  },

  async getPatientDeclinedTimes(
    trx: TrxOrDbOrQueryCreator,
    opts: { patient_appointment_request_id: string },
  ): Promise<Date[]> {
    const read_result = await trx
      .selectFrom('patient_appointment_offered_times')
      .where(
        'patient_appointment_request_id',
        '=',
        opts.patient_appointment_request_id,
      )
      .where('declined', '=', true)
      .select('start')
      .execute()

    const declined_times = []

    for (const { start } of read_result) {
      assert(isDate(start))
      declined_times.push(start)
    }

    return declined_times
  },

  createNewRequest(
    trx: TrxOrDbOrQueryCreator,
    opts: { patient_id: string },
  ): Promise<HasStringId<PatientAppointmentRequest>> {
    return trx
      .insertInto('patient_appointment_requests')
      .values({ patient_id: opts.patient_id })
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  upsert(
    trx: TrxOrDbOrQueryCreator,
    info: Appointment & { id?: string },
  ): Promise<HasStringId<Appointment>> {
    return trx
      .insertInto('appointments')
      .values(info)
      .onConflict((oc) => oc.column('id').doUpdateSet(info))
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  upsertRequest(
    trx: TrxOrDbOrQueryCreator,
    info: { id?: string; patient_id: string; reason?: string | null },
  ): Promise<HasStringId<PatientAppointmentRequest>> {
    return trx
      .insertInto('patient_appointment_requests')
      .values(info)
      .onConflict((oc) => oc.column('id').doUpdateSet(info))
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  addAttendees(
    trx: TrxOrDbOrQueryCreator,
    { appointment_id, employee_ids }: {
      appointment_id: string
      employee_ids: string[]
    },
  ) {
    return trx
      .insertInto('appointment_employees')
      .values(employee_ids.map((employee_id) => ({
        appointment_id,
        confirmed: false,
        employee_id,
      })))
      .returningAll()
      .execute()
  },

  async schedule(
    trx: TrxOrDbOrQueryCreator,
    { appointment_offered_time_id, gcal_event_id }: {
      appointment_offered_time_id: string
      gcal_event_id: string
    },
  ) {
    const offered = await trx
      .selectFrom('patient_appointment_offered_times')
      .where(
        'patient_appointment_offered_times.id',
        '=',
        appointment_offered_time_id,
      )
      .innerJoin(
        'patient_appointment_requests',
        'patient_appointment_requests.id',
        'patient_appointment_request_id',
      )
      .select([
        'patient_appointment_request_id',
        'start',
        'end',
        'duration_minutes',
        'reason',
        'patient_id',
        'employee_id',
      ])
      .executeTakeFirstOrThrow()

    const { start, end, duration_minutes, patient_id, employee_id, reason } = offered
    assert(reason)

    const appointment_to_insert = {
      gcal_event_id,
      start,
      end,
      duration_minutes,
      patient_id,
      reason,
    }

    const appointment = await trx
      .insertInto('appointments')
      .values(appointment_to_insert)
      .onConflict((oc) => oc.column('id').doUpdateSet(appointment_to_insert))
      .returningAll()
      .executeTakeFirstOrThrow()

    await appointments.addAttendees(trx, {
      appointment_id: appointment.id,
      employee_ids: [employee_id],
    })

    const health_worker = await trx
      .selectFrom('employment')
      .innerJoin(
        'health_workers',
        'health_workers.id',
        'employment.health_worker_id',
      )
      .where('employment.id', '=', employee_id)
      .select('health_workers.name')
      .executeTakeFirstOrThrow()

    // TODO: select, insert, delete in one query
    const media_ids = await appointments.getMediaIdByRequestId(trx, {
      request_id: offered.patient_appointment_request_id,
    })
    if (media_ids.length) {
      await appointments.insertMedia(trx, {
        appointment_id: appointment.id,
        media_ids,
      })
    }

    await trx
      .deleteFrom('patient_appointment_requests')
      .where('id', '=', offered.patient_appointment_request_id)
      .executeTakeFirstOrThrow()

    return {
      id: appointment.id,
      reason: appointment.reason,
      employee_id,
      health_worker_name: health_worker.name,
      gcal_event_id: appointment.gcal_event_id,
      start,
    }
  },

  async countUpcoming(
    trx: TrxOrDbOrQueryCreator,
    opts: { health_worker_id: string },
  ): Promise<number> {
    const { count } = await trx
      .selectFrom('appointments')
      .innerJoin(
        'appointment_employees',
        'appointments.id',
        'appointment_employees.appointment_id',
      )
      .innerJoin(
        'employment',
        'employment.id',
        'appointment_employees.employee_id',
      )
      .where(
        'employment.health_worker_id',
        '=',
        opts.health_worker_id,
      )
      .where('start', '>=', now)
      .select([
        sql<number>`count(appointments.id)`.as('count'),
      ])
      .executeTakeFirstOrThrow()

    return count
  },

  baseQuery(trx: TrxOrDbOrQueryCreator, opts: AppointmentQuery) {
    let q = trx
      .selectFrom('appointments')
      .select((eb) => [
        'appointments.id',
        'patient_id',
        'start',
        'end',
        'duration_minutes',
        'reason',
        'gcal_event_id',
        'appointments.created_at',
        'appointments.updated_at',
        jsonArrayFrom(
          eb.selectFrom('appointment_media')
            .innerJoin('media', 'media.id', 'media_id')
            .select(['media_id', 'mime_type'])
            .whereRef(
              'appointments.id',
              '=',
              'appointment_media.appointment_id',
            ),
        ).as('media'),
      ])
      .orderBy('start', 'asc')

    if (opts.organization_id) {
      q = q.where(
        'appointments.id',
        'in',
        trx.selectFrom('appointment_employees')
          .innerJoin(
            'employment',
            'employment.id',
            'appointment_employees.employee_id',
          )
          .where('employment.organization_id', '=', opts.organization_id)
          .select('appointment_employees.appointment_id')
          .distinct(),
      )
    }

    if (opts.patient_id) {
      q = q.whereRef('appointments.patient_id', '=', 'patient_id')
    }

    switch (opts.time_range) {
      case 'all':
        return q
      case 'future':
        return q.where('appointments.start', '>=', now)
      case 'past':
        return q.where('appointments.start', '<', now)
      case 'today':
        return q
          .where('appointments.start', '>=', today_in_johannesburg)
          .where('appointments.start', '<', tomorrow_in_johannesburg)
    }
  },

  async getWithPatientInfo(
    trx: TrxOrDbOrQueryCreator,
    opts: {
      id?: string
      health_worker_id: string
    },
  ) {
    // TODO: check if this is indeed the time_range we want
    let query = appointments.baseQuery(trx, { time_range: 'all' })
      .innerJoin(
        'appointment_employees',
        'appointments.id',
        'appointment_employees.appointment_id',
      )
      .innerJoin(
        'employment',
        'employment.id',
        'appointment_employees.employee_id',
      )
      .where('employment.health_worker_id', '=', opts.health_worker_id)
      .select('confirmed')

    if (opts.id) query = query.where('appointments.id', '=', opts.id)

    const employee_appointments = await query.execute()

    if (!employee_appointments.length) return []

    const patient_ids = uniq(employee_appointments.map((a) => a.patient_id))

    const patients_of_appointments = await patients.getByIds(trx, patient_ids, { include_incomplete_registration: true })

    return employee_appointments.map((appointment) => {
      const patient = patients_of_appointments.find((p) => p.id === appointment.patient_id)
      assert(patient, `Could not find patient ${appointment.patient_id}`)
      return { ...appointment, patient }
    })
  },

  getForPatient(
    trx: TrxOrDbOrQueryCreator,
    query: AppointmentQuery & { patient_id: string },
  ) {
    return appointments.baseQuery(trx, query).select((eb) => [
      jsonArrayFrom(
        employees.baseQuery(trx, {})
          .innerJoin(
            'appointment_employees',
            'appointment_employees.employee_id',
            'employment.id',
          )
          .innerJoin(
            'employment_calendars',
            'employment.id',
            'employment_calendars.employment_id',
          )
          .where(
            'appointment_employees.appointment_id',
            '=',
            eb.ref('appointments.id'),
          )
          .select((eb_calendars) => [
            jsonBuildObject({
              gcal_availability_calendar_id: eb_calendars.ref(
                'employment_calendars.gcal_availability_calendar_id',
              ),
              gcal_appointments_calendar_id: eb_calendars.ref(
                'employment_calendars.gcal_appointments_calendar_id',
              ),
              availability_set: eb_calendars.ref(
                'employment_calendars.availability_set',
              ),
            }).as('calendars'),
            'appointment_employees.confirmed',
            'employment.health_worker_id',
          ]),
      ).as('employees'),
    ])
      .execute()
  },

  countForPatient(trx: TrxOrDbOrQueryCreator, { patient_id, time_range }: {
    patient_id: string
    time_range: 'all' | 'future' | 'past'
  }) {
    return appointments.baseQuery(trx, { time_range })
      .where('patient_id', '=', patient_id)
      .clearSelect()
      .select((eb) => eb.fn.countAll().as('count'))
      .executeTakeFirstOrThrow()
  },

  remove(trx: TrxOrDbOrQueryCreator, id: string) {
    return trx.deleteFrom('appointments').where('id', '=', id).execute()
  },

  insertRequestMedia(
    trx: TrxOrDbOrQueryCreator,
    to_insert: {
      patient_appointment_request_id: string
      media_id: string
    },
  ): Promise<HasStringId<PatientAppointmentRequestMedia>> {
    assert(to_insert.patient_appointment_request_id)
    assert(to_insert.media_id)
    return trx
      .insertInto('patient_appointment_request_media')
      .values(to_insert)
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  async getMediaIdByRequestId(
    trx: TrxOrDbOrQueryCreator,
    opts: {
      request_id: string
    },
  ): Promise<string[]> {
    const query_result = await trx.selectFrom(
      'patient_appointment_request_media',
    )
      .where('patient_appointment_request_id', '=', opts.request_id).select(
        'media_id',
      ).execute()
    return query_result.map((row) => row.media_id)
  },

  insertMedia(
    trx: TrxOrDbOrQueryCreator,
    opts: {
      appointment_id: string
      media_ids: string[]
    },
  ) {
    assert(opts.appointment_id)
    assert(opts.media_ids.length)
    const to_insert = opts.media_ids.map((media_id) => ({
      appointment_id: opts.appointment_id,
      media_id,
    }))
    return trx.insertInto('appointment_media').values(to_insert).returningAll()
      .executeTakeFirstOrThrow()
  },
}
