import { assert } from 'std/assert/assert.ts'
import {
  addTestHealthWorkerWithSession,
  describeWithWebServer,
  getFormValues,
  itUsesTrxAnd,
} from '../../../utilities.ts'
import * as cheerio from 'cheerio'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as patients from '../../../../../db/models/patients.ts'

describeWithWebServer(
  '/app/facilities/[facility_id]/waiting-room/add',
  8007,
  (route) => {
    itUsesTrxAnd('renders a page on GET', async (trx) => {
      const { fetch } = await addTestHealthWorkerWithSession(trx, {
        scenario: 'approved-nurse',
      })

      const response = await fetch(
        `${route}/app/facilities/1/waiting-room/add`,
        {},
      )

      assert(response.ok, 'should have returned ok')
      const pageContents = await response.text()

      const $ = cheerio.load(pageContents)

      const formValues = getFormValues($)
      assertEquals(formValues, {
        notes: null,
        patient_name: null,
        reason: 'seeking treatment',
      })
    })

    itUsesTrxAnd('creates a patient encounter on POST', async (trx) => {
      const testPatient = await patients.upsert(trx, {
        name: 'Test Patient',
      })
      const { fetch } = await addTestHealthWorkerWithSession(trx, {
        scenario: 'approved-nurse',
      })

      const body = new FormData()
      body.set('notes', 'Test notes')
      body.set('patient_id', String(testPatient.id))
      body.set('patient_name', 'Test Patient')
      body.set('provider_id', 'next_available')
      body.set('provider_name', 'Next Available')
      body.set('reason', 'seeking treatment')

      const response = await fetch(
        `${route}/app/facilities/1/waiting-room/add`,
        {
          method: 'POST',
          body,
        },
      )

      if (!response.ok) {
        throw new Error(await response.text())
      }

      // Assert that the patient encounter is created and added to the waiting room
      const patientEncounter = await trx
        .selectFrom('patient_encounters')
        .selectAll()
        .executeTakeFirstOrThrow()

      const waiting_room = await trx
        .selectFrom('waiting_room')
        .selectAll()
        .executeTakeFirstOrThrow()

      assertEquals(patientEncounter.appointment_id, null)
      assertEquals(patientEncounter.closed_at, null)
      assertEquals(patientEncounter.notes, 'Test notes')
      assertEquals(patientEncounter.patient_id, testPatient.id)
      assertEquals(patientEncounter.reason, 'seeking treatment')

      assertEquals(waiting_room.facility_id, 1)
      assertEquals(waiting_room.patient_encounter_id, patientEncounter.id)
    })

    itUsesTrxAnd(
      'can create a patient encounter for a new patient on POST',
      async (trx) => {
        const { fetch } = await addTestHealthWorkerWithSession(trx, {
          scenario: 'approved-nurse',
        })

        const body = new FormData()
        body.set('notes', 'Test notes')
        body.set('patient_name', 'New Patient')
        body.set('provider_id', 'next_available')
        body.set('provider_name', 'Next Available')
        body.set('reason', 'seeking treatment')

        const response = await fetch(
          `${route}/app/facilities/1/waiting-room/add`,
          {
            method: 'POST',
            body,
          },
        )

        if (!response.ok) {
          throw new Error(await response.text())
        }

        // Assert that the patient encounter is created and added to the waiting room
        const patientEncounter = await trx
          .selectFrom('patient_encounters')
          .selectAll()
          .executeTakeFirstOrThrow()

        const waiting_room = await trx
          .selectFrom('waiting_room')
          .selectAll()
          .executeTakeFirstOrThrow()

        assertEquals(patientEncounter.appointment_id, null)
        assertEquals(patientEncounter.closed_at, null)
        assertEquals(patientEncounter.notes, 'Test notes')
        assertEquals(patientEncounter.reason, 'seeking treatment')

        assertEquals(waiting_room.facility_id, 1)
        assertEquals(waiting_room.patient_encounter_id, patientEncounter.id)

        const { name } = await trx.selectFrom('patients').select(['name'])
          .where(
            'id',
            '=',
            patientEncounter.patient_id,
          ).executeTakeFirstOrThrow()
        assertEquals(name, 'New Patient')
      },
    )
  },
)
