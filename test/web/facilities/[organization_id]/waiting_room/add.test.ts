import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import {
  addTestHealthWorkerWithSession,
  getFormValues,
  route,
} from '../../../utilities.ts'
import * as cheerio from 'cheerio'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as patients from '../../../../../db/models/patients.ts'
import db from '../../../../../db/db.ts'
import generateUUID from '../../../../../util/uuid.ts'

describe(
  '/app/facilities/[organization_id]/waiting_room/add',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    it('renders a page on GET', async () => {
      const { fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
      })

      const response = await fetch(
        `${route}/app/facilities/1/waiting_room/add`,
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
      const { fetch } = await addTestHealthWorkerWithSession(db, {
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
        `${route}/app/facilities/1/waiting_room/add`,
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
        .where('patient_id', '=', testPatient.id)
        .selectAll()
        .executeTakeFirstOrThrow()

      const waiting_room = await db
        .selectFrom('waiting_room')
        .where('patient_encounter_id', '=', patientEncounter.id)
        .selectAll()
        .executeTakeFirstOrThrow()

      assertEquals(patientEncounter.appointment_id, null)
      assertEquals(patientEncounter.closed_at, null)
      assertEquals(patientEncounter.notes, 'Test notes')
      assertEquals(patientEncounter.patient_id, testPatient.id)
      assertEquals(patientEncounter.reason, 'seeking treatment')

      assertEquals(waiting_room.organization_id, 1)
      assertEquals(waiting_room.patient_encounter_id, patientEncounter.id)
    })

    it('can create a patient encounter for a new patient on POST', async () => {
      const { fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
      })

      const patient_name = generateUUID()
      const body = new FormData()
      body.set('notes', 'Test notes')
      body.set('patient_name', patient_name)
      body.set('provider_id', 'next_available')
      body.set('provider_name', 'Next Available')
      body.set('reason', 'seeking treatment')

      const response = await fetch(
        `${route}/app/facilities/1/waiting_room/add`,
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
        .where(
          'patient_id',
          '=',
          db.selectFrom('patients').select('id').where(
            'name',
            '=',
            patient_name,
          ),
        )
        .selectAll()
        .executeTakeFirstOrThrow()

      const waiting_room = await db
        .selectFrom('waiting_room')
        .where('patient_encounter_id', '=', patientEncounter.id)
        .selectAll()
        .executeTakeFirstOrThrow()

      assertEquals(patientEncounter.appointment_id, null)
      assertEquals(patientEncounter.closed_at, null)
      assertEquals(patientEncounter.notes, 'Test notes')
      assertEquals(patientEncounter.reason, 'seeking treatment')

      assertEquals(waiting_room.organization_id, 1)
      assertEquals(waiting_room.patient_encounter_id, patientEncounter.id)

      const { name } = await db.selectFrom('patients').select(['name']).where(
        'id',
        '=',
        patientEncounter.patient_id,
      ).executeTakeFirstOrThrow()
      assertEquals(name, patient_name)
    })
  },
)
