import { afterAll, describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as makeAppointment from '../../../shared/scheduling/makeAppointment.ts'
import * as appointments from '../../../db/models/appointments.ts'
import * as patients from '../../../db/models/patients.ts'
import { addTestHealthWorker } from '../../web/utilities.ts'
import { itUsesTrxAnd } from '../../web/utilities.ts'
import { spy } from 'std/testing/mock.ts'
import { GCalEvent, GoogleTokens } from '../../../types.ts'
import db from '../../../db/db.ts'

describe('scheduling/makeAppointment.ts', () => {
  afterAll(() => db.destroy())
  describe('makeAppointmentWeb', () => {
    itUsesTrxAnd(
      "inserts an event on the specified health worker's google calendar, adding that event to the db",
      async (trx) => {
        const insertEvent = spy((_1: GoogleTokens, _2, _3) =>
          Promise.resolve({
            id: 'inserted google event id',
          } as GCalEvent)
        )
        const healthWorker = await addTestHealthWorker(trx, {
          scenario: 'doctor',
        })

        const patient = await patients.insert(trx, {
          name: 'Test',
        })

        await makeAppointment.makeAppointmentWeb(trx, {
          start: '2023-10-12T12:30:00+02:00',
          end: '2023-10-12T13:00:00+02:00',
          reason: 'back pain',
          duration_minutes: 30,
          patient_id: patient.id,
          provider_ids: [healthWorker.employee_id!],
        }, insertEvent)

        assertEquals(insertEvent.calls.length, 1)
        assertEquals(insertEvent.calls[0].args.length, 3)
        assertEquals(
          insertEvent.calls[0].args[0]!.access_token,
          healthWorker.access_token,
        )
        assertEquals(
          insertEvent.calls[0].args[0].refresh_token,
          healthWorker.refresh_token,
        )
        assertEquals(
          insertEvent.calls[0].args[1],
          healthWorker.calendars!.gcal_appointments_calendar_id,
        )
        assertEquals(insertEvent.calls[0].args[2], {
          start: {
            dateTime: '2023-10-12T12:30:00+02:00',
          },
          end: {
            dateTime: '2023-10-12T13:00:00+02:00',
          },
          summary: 'Appointment',
        })

        const result = await appointments.getWithPatientInfo(trx, {
          health_worker_id: healthWorker.id,
        })

        assertEquals(result, [{
          confirmed: false,
          created_at: result[0].created_at,
          gcal_event_id: 'inserted google event id',
          id: result[0].id,
          media: [],
          patient: {
            avatar_url: null,
            dob_formatted: null,
            address: null,
            age_display: null,
            age_years: null,
            description: null,
            primary_provider_name: null,
            nearest_organization_id: null,
            primary_provider_health_worker_id: null,
            primary_provider_profession: null,
            primary_provider_organization_name: null,
            primary_provider_avatar_url: null,
            gender: null,
            ethnicity: null,
            id: patient.id,
            last_visited: null,
            location: { longitude: null, latitude: null },
            name: 'Test',
            national_id_number: null,
            nearest_organization: null,
            phone_number: null,
            completed_intake: false,
            actions: {
              view: `/app/patients/${patient.id}`,
            },
            open_encounter: null,
          },
          patient_id: patient.id,
          reason: 'back pain',
          start: new Date('2023-10-12T10:30:00.000Z'),
          end: new Date('2023-10-12T11:00:00.000Z'),
          duration_minutes: 30,
          updated_at: result[0].updated_at,
        }])
      },
    )
  })
})
