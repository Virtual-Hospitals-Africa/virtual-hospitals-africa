import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import sinon from 'npm:sinon'
import { resetInTest } from '../../db/reset.ts'
import * as google from '../../external-clients/google.ts'
import * as makeAppointment from '../../scheduling/makeAppointment.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as appointments from '../../db/models/appointments.ts'
import * as patients from '../../db/models/patients.ts'
import { assert } from 'std/assert/assert.ts'
import { testHealthWorker } from '../mocks.ts'

describe('scheduling/makeAppointment.ts', { sanitizeResources: false }, () => {
  beforeEach(resetInTest)

  // deno-lint-ignore no-explicit-any
  let insertEvent: any
  beforeEach(() => {
    insertEvent = sinon.stub(google.GoogleClient.prototype, 'insertEvent')
      .resolves({
        id: 'inserted google event id',
      })
  })
  afterEach(() => {
    insertEvent.restore()
  })

  describe('makeAppointmentWeb', () => {
    it('inserts an event on the specified health worker\'s google calendar, adding that event to the db', async () => {
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
      })

      assert(insertEvent.calledOnce)
      assertEquals(insertEvent.firstCall.args, [
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
          gender: null,
          ethnicity: null,
          href: `/app/patients/${patient.id}`,
          id: patient.id,
          last_visited: null,
          location: null,
          medical_record: {
            allergies: [
              'chocolate',
              'bananas',
            ],
            history: {},
          },
          name: 'Test',
          national_id_number: null,
          nearest_facility: null,
          phone_number: null,
          updated_at: patient.updated_at,
          conversation_state: 'initial_message',
          completed_onboarding: false,
        },
        patient_id: patient.id,
        reason: 'back pain',
        start: new Date('2023-10-12T10:30:00.000Z'),
        updated_at: result[0].updated_at,
      }])
    })
  })
})
