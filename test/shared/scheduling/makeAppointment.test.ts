import { describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import sinon from 'npm:sinon'
import * as makeAppointment from '../../../shared/scheduling/makeAppointment.ts'
import * as appointments from '../../../db/models/appointments.ts'
import * as patients from '../../../db/models/patients.ts'
import { assert } from 'std/assert/assert.ts'
import { addTestHealthWorker } from '../../web/utilities.ts'
import { itUsesTrxAnd } from '../../web/utilities.ts'

describe('scheduling/makeAppointment.ts', { sanitizeResources: false }, () => {
  describe('makeAppointmentWeb', () => {
    itUsesTrxAnd(
      "inserts an event on the specified health worker's google calendar, adding that event to the db",
      async (trx) => {
        const insertEvent = sinon.stub().resolves({
          id: 'inserted google event id',
        })
        const healthWorker = await addTestHealthWorker(trx, {
          scenario: 'doctor',
        })

        const patient = await patients.upsert(trx, {
          name: 'Test',
        })

        await makeAppointment.makeAppointmentWeb(trx, {
          start: '2023-10-12T12:30:00+02:00',
          end: '2023-10-12T13:00:00+02:00',
          reason: 'back pain',
          durationMinutes: 30,
          patient_id: patient.id,
          provider_ids: [healthWorker.employee_id!],
        }, insertEvent)

        assert(insertEvent.calledOnce)
        assertEquals(insertEvent.firstCall.args.length, 3)
        assertEquals(
          insertEvent.firstCall.args[0].access_token,
          healthWorker.access_token,
        )
        assertEquals(
          insertEvent.firstCall.args[0].refresh_token,
          healthWorker.refresh_token,
        )
        assertEquals(
          insertEvent.firstCall.args[1],
          healthWorker.calendars!.gcal_appointments_calendar_id,
        )
        assertEquals(insertEvent.firstCall.args[2], {
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
            description: null,
            gender: null,
            ethnicity: null,
            id: patient.id,
            last_visited: null,
            location: { longitude: null, latitude: null },
            name: 'Test',
            national_id_number: null,
            nearest_facility: null,
            phone_number: null,
            conversation_state: 'initial_message',
            completed_intake: false,
            intake_steps_completed: [],
            actions: {
              view: `/app/patients/${patient.id}`,
            },
            open_encounter: null,
          },
          patient_id: patient.id,
          reason: 'back pain',
          start: new Date('2023-10-12T10:30:00.000Z'),
          updated_at: result[0].updated_at,
        }])
      },
    )
  })
})
