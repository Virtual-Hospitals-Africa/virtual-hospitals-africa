import { it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import {
  addTestHealthWorkerWithSession,
  describeWithWebServer,
  getFormValues,
} from '../../../utilities.ts'
import * as cheerio from 'cheerio'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as patients from '../../../../../db/models/patients.ts'
import db from '../../../../../db/db.ts'

describeWithWebServer(
  '/app/facilities/[facility_id]/waiting-room/add',
  8007,
  (route) => {
    it('renders a page on GET', async () => {
      const { fetch } = await addTestHealthWorkerWithSession({
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

    it('creates a patient encounter on POST', async () => {
      const testPatient = await patients.upsert(db, {
        name: 'Test Patient',
      })
      const { fetch } = await addTestHealthWorkerWithSession({
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
      const patientEncounter = await db
        .selectFrom('patient_encounters')
        .selectAll()
        .executeTakeFirstOrThrow()

      const waiting_room = await db
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

    it('can create a patient encounter for a new patient on POST', async () => {
      const { fetch } = await addTestHealthWorkerWithSession({
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
      const patientEncounter = await db
        .selectFrom('patient_encounters')
        .selectAll()
        .executeTakeFirstOrThrow()

      const waiting_room = await db
        .selectFrom('waiting_room')
        .selectAll()
        .executeTakeFirstOrThrow()

      assertEquals(patientEncounter.appointment_id, null)
      assertEquals(patientEncounter.closed_at, null)
      assertEquals(patientEncounter.notes, 'Test notes')
      assertEquals(patientEncounter.reason, 'seeking treatment')

      assertEquals(waiting_room.facility_id, 1)
      assertEquals(waiting_room.patient_encounter_id, patientEncounter.id)

      const { name } = await db.selectFrom('patients').select(['name']).where(
        'id',
        '=',
        patientEncounter.patient_id,
      ).executeTakeFirstOrThrow()
      assertEquals(name, 'New Patient')
    })
  },
)
