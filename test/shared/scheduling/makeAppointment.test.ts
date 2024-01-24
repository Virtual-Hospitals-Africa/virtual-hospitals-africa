import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../db/db.ts'
import sinon from 'npm:sinon'
import * as makeAppointment from '../../../shared/scheduling/makeAppointment.ts'
import * as health_workers from '../../../db/models/health_workers.ts'
import * as appointments from '../../../db/models/appointments.ts'
import * as patients from '../../../db/models/patients.ts'
import { assert } from 'std/assert/assert.ts'
import { testHealthWorker } from '../../mocks.ts'

describe('scheduling/makeAppointment.ts', { sanitizeResources: false }, () => {
  describe('makeAppointmentWeb', () => {
    it("inserts an event on the specified health worker's google calendar, adding that event to the db", async () => {
      const insertEvent = sinon.stub().resolves({
        id: 'inserted google event id',
      })
      const healthWorker = await health_workers.upsertWithGoogleCredentials(
        db,
        testHealthWorker(),
      )
      const patient = await patients.upsert(db, {
        name: 'Test',
      })

      await makeAppointment.makeAppointmentWeb(db, {
        start: '2023-10-12T12:30:00+02:00',
        end: '2023-10-12T13:00:00+02:00',
        reason: 'back pain',
        durationMinutes: 30,
        patient_id: patient.id,
        health_worker_ids: [healthWorker.id],
      }, insertEvent)

      assert(insertEvent.calledOnce)
      assertEquals(insertEvent.firstCall.args, [
        healthWorker,
        healthWorker.gcal_appointments_calendar_id,
        {
          start: {
            dateTime: '2023-10-12T12:30:00+02:00',
          },
          end: {
            dateTime: '2023-10-12T13:00:00+02:00',
          },
          summary: 'Appointment',
        },
      ])

      const result = await appointments.getWithPatientInfo(db, {
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
          created_at: patient.created_at,
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
          updated_at: patient.updated_at,
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
    })
  })
})
